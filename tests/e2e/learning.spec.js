import { test, expect } from '@playwright/test';
import {
  alphabet,
  boot,
  chapter,
  practiceAlphabet,
  pair,
  matchQuestion,
  completeTypingFromDisplayedSteps,
  inventory,
} from './helpers';

test('three automatic A–Z rounds, sounds on every key, retry only after three, and cloze judges complete answers', async ({
  page,
}) => {
  const errors = await boot(page);
  await chapter(page, 1);
  await expect(page.locator('#capsMode')).toHaveText('大写');
  for (let round = 1; round <= 3; round++) {
    await page.evaluate(() => {
      window.__audioEvents = [];
    });
    await page.keyboard.type(alphabet);
    await expect(page.locator('#introStatus')).toContainText(`已完成 ${round}`);
    expect(
      await page.evaluate(() => window.__audioEvents.filter((e) => e.kind === 'tone').length),
    ).toBe(29); // 25 ticks + 4-note chord
    await expect(page.locator('#lessonRetry'))[round === 3 ? 'toBeVisible' : 'toBeHidden']();
    await expect(page.locator('#lessonContinue'))[round === 3 ? 'toBeEnabled' : 'toBeDisabled']();
    if (round < 3) {
      await expect(page.locator('.alphabet-tile.done')).toHaveCount(0);
      await page.keyboard.type('ax');
      await expect(page.locator('.alphabet-tile.done')).toHaveCount(0);
      await expect(page.locator('#introStatus')).toContainText(`已完成 ${round}`);
      await expect(page.locator('#introStatus')).toContainText('输入不正确');
    }
  }
  await page.getByRole('button', { name: '重试一次' }).click();
  await expect(page.locator('#lessonRetry')).toBeHidden();
  await page.keyboard.type(alphabet);
  await expect(page.locator('#introStatus')).toContainText('已完成 4 轮');
  await page.getByRole('button', { name: '继续，开始填空' }).click();
  await page.evaluate(() => {
    window.__audioEvents = [];
  });
  await page.keyboard.type('zz');
  await expect(page.locator('.cloze-gap.wrong')).toHaveCount(0);
  expect(await page.evaluate(() => window.__audioEvents.length)).toBe(0);
  await page.keyboard.press('Backspace');
  await expect(page.locator('#gap_1')).toHaveText('\u00a0');
  await page.keyboard.type('zz');
  await expect(page.locator('#clozeStatus')).toHaveText('顺序不太对，再试一次');
  await expect(page.locator('#masteryValue')).toHaveText('-1 / 48');
  await expect(page.locator('#lessonProgress')).toContainText('−');
  for (let i = 2; i <= 7; i++) {
    await expect(page.locator('#clozeStatus')).toContainText('填完后');
    await page.keyboard.type('zzz');
    await expect(page.locator('#masteryValue')).toHaveText(`${-Math.min(i, 6)} / 48`);
  }
  await expect(page.locator('#clozeStatus')).toContainText('填完后');
  await page.getByRole('button', { name: '显示提示' }).click();
  await expect(page.locator('#masteryValue')).toHaveText('-6 / 48');
  await expect(page.locator('#clozeHelpNote')).toHaveText('本章正分已清空，负分保留');
  await expect(page.locator('.tl-ch').nth(1)).toHaveClass(/negative/);
  await page.getByRole('button', { name: '隐藏提示' }).click();
  await page.getByRole('button', { name: '显示提示' }).click();
  await expect(page.locator('#masteryValue')).toHaveText('-6 / 48');
  await expect(page.locator('.cloze-gap.ghost')).toHaveCount(3);
  const answer = (await page.locator('.cloze-gap').allTextContents()).join('');
  await page.keyboard.type(answer.toLowerCase());
  await expect(page.locator('#clozeStatus')).toHaveText('全部正确');
  await expect(page.locator('#masteryValue')).toHaveText('-6 / 48');
  await expect(page.locator('#clozeStatus')).toContainText('填完后');
  const nextAnswer = await page.locator('.cloze-slots').evaluate((row) => {
    const firstGap = row.querySelector('.cloze-gap');
    const before = firstGap.previousElementSibling;
    const start = before ? before.textContent.charCodeAt(0) + 1 : 65;
    return String.fromCharCode(start, start + 1, start + 2);
  });
  await page.keyboard.type(nextAnswer.toLowerCase());
  await expect(page.locator('#masteryValue')).toHaveText('-5 / 48');
  expect(errors).toEqual([]);
});

test('all listening modes: free playback, repeated penalties, whole-board credit, hints clear credit and retain debts', async ({
  page,
}) => {
  const errors = await boot(page);
  const modes = new Set();
  for (const randomSeed of [1, 2, 5]) {
    // Each variant starts a fresh session; hints intentionally retain previous debts.
    if (randomSeed !== 1) {
      await page.reload();
      await page.locator('#startBtn').click();
      await expect(page.locator('#overlay')).toHaveClass('hide');
    }
    await chapter(page, 0, randomSeed);
    await page.getByRole('button', { name: '继续，开始配对' }).click();
    const q = await matchQuestion(page);
    modes.add(q.type);
    expect(q.audios.length).toBeGreaterThan(q.targets.length);
    const distractor = q.audios.find((l) => !q.targets.includes(l));
    await page.getByRole('button', { name: `选择字母 ${q.targets[0]}`, exact: true }).click();
    for (const audio of q.audios)
      await page.locator(`.match-audios [data-letter="${audio}"]`).click();
    await expect(page.locator('#masteryValue')).toHaveText('0 / 52');
    for (let n = 1; n <= 8; n++) {
      await pair(page, distractor, q.targets[0]);
      await expect(page.locator('#masteryValue')).toHaveText(`${-Math.min(n, 6)} / 52`);
    }
    await expect(page.locator('.tl-ch').first()).toHaveClass(/negative/);
    for (let i = 0; i < q.targets.length; i++) {
      await pair(page, q.targets[i]);
      await expect(page.locator('#masteryValue')).toHaveText(
        `${i === q.targets.length - 1 ? -6 + q.targets.length : -6} / 52`,
      );
    }
    await expect(page.locator('.match-card.matched')).toHaveCount(0);
    const hinted = await matchQuestion(page);
    await page.locator('.listen-icon-btn').first().click();
    await expect(page.locator('#masteryValue')).toHaveText('-6 / 52');
    await expect(page.locator('.match-help-note')).toHaveText(
      '本章正分已清空，负分保留，本组不计分',
    );
    await expect(page.locator('.tl-ch').first()).toHaveClass(/negative/);
    await page.locator('.listen-icon-btn').first().click();
    await expect(page.locator('#masteryValue')).toHaveText('-6 / 52');
    for (const letter of hinted.targets) await pair(page, letter);
    await expect(page.locator('#masteryValue')).toHaveText('-6 / 52');
    await expect(page.locator('.match-card.matched')).toHaveCount(0);
  }
  expect([...modes].sort()).toEqual(['board', 'contrast', 'single']);
  expect(errors).toEqual([]);
});

test('all 33 typing chapters accept internal input modes, update prompts, and errors/timeouts restart the chapter', async ({
  page,
}) => {
  const errors = await boot(page);
  for (let i = 2; i < inventory.length; i++) {
    await chapter(page, i);
    await expect(page.locator('#capsMode')).toHaveText([2, 4].includes(i) ? '大写' : '小写');
    const count = await completeTypingFromDisplayedSteps(page);
    expect(count).toBeGreaterThan(0);
    await expect(page.locator('#target')).toHaveClass(/ok/);
    await expect(page.locator('#err')).toHaveText('错误 0');
    if (i >= 21) await expect(page.locator('.p-char:not(.p-done)')).toHaveCount(0);
  }
  await chapter(page, 2);
  await completeTypingFromDisplayedSteps(page);
  await expect(page.locator('#round')).toHaveText('2 / 30');
  await page.keyboard.press('Digit1');
  await expect(page.locator('#flash')).toContainText('从第 1 题重来');
  await expect(page.locator('#round')).toHaveText('1 / 30');
  await page.clock.install();
  await page.clock.runFor(12_000);
  await expect(page.locator('#err')).toHaveText('错误 2');
  expect(errors).toEqual([]);
});

test('all 26 local pronunciations are preloaded and play without further requests; corpus import replaces prompts', async ({
  page,
}) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const errors = await boot(page);
  expect(requests.filter((url) => url.endsWith('.mp3'))).toHaveLength(26);
  expect(requests.filter((url) => !url.startsWith('http://127.0.0.1:4173/'))).toEqual([]);
  const count = requests.length;
  for (const letter of alphabet.toUpperCase()) {
    await page.getByRole('button', { name: `试听字母 ${letter}`, exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() => window.__audioEvents.filter((e) => e.kind === 'voice').length),
      )
      .toBe(alphabet.indexOf(letter.toLowerCase()) + 1);
  }
  expect(requests.length).toBe(count);
  await page.reload();
  await page.locator('#fileInput').setInputFiles({
    name: 'custom.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('# 注释\n你好吗\n\n'),
  });
  await expect(page.locator('#fileInfo')).toHaveText('已加载 1 句（编码：UTF-8）');
  await page.locator('#startBtn').click();
  await chapter(page, 21);
  await expect(page.locator('#prompt')).toHaveText('你好吗');
  await page.reload();
  await page.locator('#fileInput').setInputFiles({
    name: 'gbk.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from([0xc4, 0xe3, 0xba, 0xc3]),
  });
  await expect(page.locator('#fileInfo')).toHaveText('已加载 1 句（编码：GBK/ANSI）');
  expect(errors).toEqual([]);
});

test('desktop and narrow layouts retain centered input status and chapter-sized timeline', async ({
  page,
}) => {
  const errors = await boot(page);
  for (const width of [1280, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await chapter(page, 0);
    await page.getByRole('button', { name: '继续，开始配对' }).click();
    await expect(page.locator('.tl-ch')).toHaveCount(35);
    for (let n = 0; n < 5; n++) {
      const box = await page.locator('#topStatus').boundingBox();
      expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const q = await matchQuestion(page);
      for (const letter of q.targets) await pair(page, letter);
      await expect(page.locator('.match-card.matched')).toHaveCount(0);
    }
    await chapter(page, 1);
    const box = await page.locator('#topStatus').boundingBox();
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(1);
  }
  expect(errors).toEqual([]);
});

test('mastery completion advances both letter chapters, and finishing the course increases difficulty', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = await boot(page);
  await chapter(page, 0, 173);
  await page.clock.install();
  await page.getByRole('button', { name: '继续，开始配对' }).click();
  let rounds = 0;
  while ((await page.locator('#chTitle').textContent()) === inventory[0].title && rounds++ < 120) {
    const q = await matchQuestion(page);
    for (const letter of q.targets) await pair(page, letter);
    await page.clock.fastForward(650);
  }
  await expect(page.locator('#chTitle')).toHaveText(inventory[1].title);
  await expect(page.locator('.tl-ch').first()).toHaveClass(/done/);
  for (let n = 0; n < 3; n++) {
    await page.keyboard.type(alphabet);
    await page.clock.fastForward(500);
  }
  await page.getByRole('button', { name: '继续，开始填空' }).click();
  for (let n = 0; n < 48; n++) {
    const answer = await page.locator('.cloze-slots').evaluate((row) => {
      const before = row.querySelector('.cloze-gap').previousElementSibling;
      const start = before ? before.textContent.charCodeAt(0) + 1 : 65;
      return String.fromCharCode(start, start + 1, start + 2);
    });
    await page.keyboard.type(answer.toLowerCase());
    await page.clock.fastForward(700);
  }
  await expect(page.locator('#chTitle')).toHaveText(inventory[2].title);
  await chapter(page, 34);
  for (let n = 0; n < 15; n++) {
    await completeTypingFromDisplayedSteps(page);
    await page.clock.fastForward(500);
  }
  await expect(page.locator('#chTitle')).toHaveText(inventory[0].title);
  await expect(page.locator('#tier')).toHaveText('难度 2 / 4');
  expect(errors).toEqual([]);
});
