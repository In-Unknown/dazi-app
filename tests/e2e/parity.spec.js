import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { boot, chapter, inventory, pair, matchQuestion, practiceAlphabet } from './helpers';

async function stabilizeVisuals(...pages) {
  // Compare the resting layout; transition interpolation depends on capture timing.
  await Promise.all(
    pages.map((page) =>
      page.addStyleTag({
        content:
          '*,*::before,*::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }',
      }),
    ),
  );
}

// Approved copy change for min(score, 0). Only the old page's labels are aligned;
// its scoring code stays untouched. The new rule is checked in learning.spec.js.
async function alignBaselineHintCopy(page) {
  await page.evaluate(() => {
    const replace = (text) =>
      text
        .replaceAll('清空本章全部熟练度', '清空本章正分，保留负分')
        .replaceAll('本章熟练度已清零', '本章正分已清空，负分保留');
    document.querySelectorAll('.match-help-note, .cloze-help-note').forEach((el) => {
      el.textContent = replace(el.textContent);
    });
    document.querySelectorAll('.listen-icon-btn').forEach((el) => {
      for (const attribute of ['aria-label', 'title']) {
        const value = el.getAttribute(attribute);
        if (value) el.setAttribute(attribute, replace(value));
      }
    });
  });
}

async function snapshot(page, baseline = false) {
  if (baseline) await alignBaselineHintCopy(page);
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
  return page.evaluate(() => {
    const text = (id) => document.getElementById(id).textContent;
    const geometry = (id) => {
      const r = document.getElementById(id).getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map((x) => Math.round(x * 100) / 100);
    };
    return {
      title: text('chTitle'),
      description: text('chDesc'),
      prompt: text('prompt'),
      hint: text('hint'),
      steps: text('rawBox'),
      target: document.getElementById('target').innerHTML,
      input: [text('imeMode'), text('capsMode')],
      scores: text('round'),
      statusBox: geometry('topStatus'),
      targetBox: geometry('target'),
      timeline: [...document.querySelectorAll('.tl-ch')].map((el) => [
        el.className,
        el.getAttribute('aria-valuenow'),
      ]),
    };
  });
}

async function compareScreenshots(oldPage, newPage, testInfo, label) {
  await alignBaselineHintCopy(oldPage);
  const options = (page) => ({
    animations: 'disabled',
    mask: [page.locator('footer')],
    caret: 'hide',
  });
  const [before, after] = await Promise.all([
    oldPage.screenshot(options(oldPage)),
    newPage.screenshot(options(newPage)),
  ]);
  const a = PNG.sync.read(before),
    b = PNG.sync.read(after);
  expect([b.width, b.height]).toEqual([a.width, a.height]);
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  if (changed > 0) {
    await testInfo.attach(`${label}-before`, { body: before, contentType: 'image/png' });
    await testInfo.attach(`${label}-after`, { body: after, contentType: 'image/png' });
    await testInfo.attach(`${label}-diff`, {
      body: PNG.sync.write(diff),
      contentType: 'image/png',
    });
  }
  // Ignore antialiasing, but do not tolerate moved blocks or changed content.
  expect(changed / (a.width * a.height), label).toBeLessThan(0.001);
  return changed;
}

test('old/new parity: all 35 chapters have identical content, steps, layout and screenshots', async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(180_000);
  const original = await context.newPage();
  const [newErrors, oldErrors] = await Promise.all([boot(page), boot(original, true)]);
  await stabilizeVisuals(original, page);
  const report = [];
  for (let i = 0; i < inventory.length; i++) {
    await chapter(original, i, 812 + i);
    await chapter(page, i, 812 + i);
    const before = await snapshot(original, true);
    const after = await snapshot(page);
    expect(after, inventory[i].id).toEqual(before);
    const changedPixels = await compareScreenshots(original, page, testInfo, inventory[i].id);
    report.push({ chapter: inventory[i].id, changedPixels });
  }
  await testInfo.attach('chapter-parity.json', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  });
  expect(newErrors).toEqual([]);
  expect(oldErrors).toEqual([]);
});

test('old/new parity: listening variants, completed preparation and cloze at desktop/mobile widths', async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(180_000);
  const original = await context.newPage();
  await Promise.all([boot(page), boot(original, true)]);
  await stabilizeVisuals(original, page);
  for (const width of [1280, 360]) {
    await original.setViewportSize({ width, height: 1000 });
    await page.setViewportSize({ width, height: 1000 });
    await chapter(original, 0, 591);
    await chapter(page, 0, 591);
    await original.getByRole('button', { name: '继续，开始配对' }).click();
    await page.getByRole('button', { name: '继续，开始配对' }).click();
    for (let n = 0; n < 5; n++) {
      const q = await matchQuestion(original);
      expect(await matchQuestion(page)).toEqual(q);
      await compareScreenshots(original, page, testInfo, `listening-${q.type}-${width}`);
      for (const letter of q.targets) {
        await pair(original, letter);
        await pair(page, letter);
      }
      await expect(original.locator('.match-card.matched')).toHaveCount(0);
      await expect(page.locator('.match-card.matched')).toHaveCount(0);
    }
    await chapter(original, 1, 829);
    await chapter(page, 1, 829);
    await practiceAlphabet(original);
    await practiceAlphabet(page);
    await compareScreenshots(original, page, testInfo, `prepared-${width}`);
    await original.getByRole('button', { name: '继续，开始填空' }).click();
    await page.getByRole('button', { name: '继续，开始填空' }).click();
    expect(await snapshot(page)).toEqual(await snapshot(original, true));
    await compareScreenshots(original, page, testInfo, `cloze-${width}`);
    await original.getByRole('button', { name: '显示提示' }).click();
    await page.getByRole('button', { name: '显示提示' }).click();
    await compareScreenshots(original, page, testInfo, `cloze-hint-${width}`);
  }
});
