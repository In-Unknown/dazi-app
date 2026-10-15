import { expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

export const inventory = JSON.parse(
  readFileSync(new URL('../../docs/chapter-inventory.json', import.meta.url), 'utf8'),
);
export const alphabet = 'abcdefghijklmnopqrstuvwxyz';

export async function boot(page, baseline = false) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__audioEvents = [];
    const oscillatorStart = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      window.__audioEvents.push({ kind: 'tone', frequency: this.frequency.value });
      return oscillatorStart.apply(this, args);
    };
    const bufferStart = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__audioEvents.push({ kind: 'voice', offset: args[1] ?? 0 });
      return bufferStart.apply(this, args);
    };
  });
  if (baseline) {
    await page.route('**/__baseline.html', (route) =>
      route.fulfill({ path: 'tests/fixtures/baseline.html', contentType: 'text/html' }),
    );
    await page.route('https://cdn.jsdelivr.net/npm/pinyin-pro@3/dist/index.js', (route) =>
      route.fulfill({
        path: 'node_modules/pinyin-pro/dist/index.js',
        contentType: 'application/javascript',
      }),
    );
  }
  await page.goto(baseline ? '/__baseline.html' : '/');
  await page.locator('#startBtn').click();
  await expect(page.locator('#overlay')).toHaveClass('hide');
  await expect(page.locator('.alphabet-tile')).toHaveCount(26);
  return errors;
}

export async function seed(page, value) {
  await page.evaluate((value) => {
    let state = value >>> 0;
    Math.random = () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }, value);
}

export async function chapter(page, index, randomSeed = 1000 + index) {
  const panel = page.locator('#debugPanel');
  if ((await panel.getAttribute('class')).includes('hide'))
    await page.locator('#debugToggle').click();
  await seed(page, randomSeed);
  await panel
    .getByRole('button', {
      name: `${String(index + 1).padStart(2, '0')}${inventory[index].title}`,
      exact: true,
    })
    .click();
  await page.locator('#dbgClose').click();
  await expect(page.locator('#chTitle')).toHaveText(inventory[index].title);
}

export async function practiceAlphabet(page) {
  for (let round = 1; round <= 3; round++) {
    await page.keyboard.type(alphabet);
    await expect(page.locator('#introStatus')).toContainText(`已完成 ${round}`);
    if (round < 3) await expect(page.locator('.alphabet-tile.done')).toHaveCount(0);
  }
  await expect(page.getByRole('button', { name: '继续，开始填空' })).toBeEnabled();
}

export async function matchQuestion(page) {
  return page.locator('.match-board').evaluate((board) => ({
    type: board.dataset.kind,
    targets: [...board.querySelectorAll('.match-letters .match-card')].map(
      (el) => el.dataset.letter,
    ),
    audios: [...board.querySelectorAll('.match-audios .match-card')].map((el) => el.dataset.letter),
  }));
}

export async function pair(page, audio, letter = audio) {
  await page.locator(`.match-audios [data-letter="${audio}"]`).click();
  await page.getByRole('button', { name: `选择字母 ${letter}`, exact: true }).click();
}

export async function completeTypingFromDisplayedSteps(page) {
  return page.evaluate(() => {
    const punctuationCodes = {
      ' ': 'Space',
      Enter: 'Enter',
      ',': 'Comma',
      '.': 'Period',
      ';': 'Semicolon',
      "'": 'Quote',
      '/': 'Slash',
      '\\': 'Backslash',
      '[': 'BracketLeft',
      ']': 'BracketRight',
      '-': 'Minus',
      '=': 'Equal',
      '`': 'Backquote',
    };
    const lines = document.getElementById('rawBox').textContent.split('\n');
    for (const line of lines) {
      const type = line.match(/\d+ (char|sp|nl|caps-down|caps-up|shift-down|shift-up)/)?.[1];
      let code;
      if (type?.startsWith('caps')) code = 'CapsLock';
      else if (type?.startsWith('shift')) code = 'ShiftLeft';
      else if (type === 'sp') code = 'Space';
      else if (type === 'nl') code = 'Enter';
      else {
        const base = line.match(/\|base=(.*)\]$/)?.[1];
        code = /^[a-z]$/i.test(base)
          ? `Key${base.toUpperCase()}`
          : /^\d$/.test(base)
            ? `Digit${base}`
            : punctuationCodes[base];
      }
      if (!code) throw new Error(`No key for ${line}`);
      // Deliberately disagree with physical case/IME: the app owns these modes.
      const event = new KeyboardEvent(type.endsWith('-up') ? 'keyup' : 'keydown', {
        code,
        key: 'Process',
        isComposing: true,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'getModifierState', {
        value: () => {
          throw new Error('Read physical keyboard state');
        },
      });
      document.dispatchEvent(event);
      if (document.getElementById('target').classList.contains('shake'))
        throw new Error(`Input rejected at ${line}`);
    }
    return lines.length;
  });
}
