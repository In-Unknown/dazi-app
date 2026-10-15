import { test, expect } from '@playwright/test';
import { boot, chapter, inventory, completeTypingFromDisplayedSteps } from './helpers';

async function importPrompt(page, text, id) {
  await page.reload();
  await page.locator('#fileInput').setInputFiles({
    name: 'polyphones.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(text),
  });
  await expect(page.locator('#fileInfo')).toHaveText('已加载 1 句（编码：UTF-8）');
  await page.locator('#startBtn').click();
  await chapter(
    page,
    inventory.findIndex((ch) => ch.id === id),
  );
  await expect(page.locator('#prompt')).toHaveText(text);
}

test('imported sentence displays le, accepts its keys and highlights both corresponding characters', async ({
  page,
}) => {
  const errors = await boot(page);
  const text = '淑如又沉默了一会儿，然后略微提高了一点音量说道：';
  await importPrompt(page, text, 'chinese-sentences-full');
  const displayed = await page.locator('#target .ch').allTextContents();
  expect(displayed.join('').replaceAll('\u00a0', ' ')).toBe(
    'shu ru you chen mo le yi hui er ，ran hou lüe wei ti gao le yi dian yin liang shuo dao ：',
  );
  await page.keyboard.press('Shift');
  await page.keyboard.type('shu ru you chen mo le ');
  await expect(page.locator('.p-char').nth(5)).toHaveClass(/p-done/);
  await page.keyboard.type('yi hui er ');
  await page.keyboard.press('Comma');
  await page.keyboard.type('ran hou lve wei ti gao le ');
  await expect(page.locator('.p-char').nth(16)).toHaveClass(/p-done/);
  await page.keyboard.type('yi dian yin liang shuo dao ');
  await page.keyboard.press('Shift+Semicolon');
  await expect(page.locator('#target')).toHaveClass(/ok/);
  await expect(page.locator('.p-char:not(.p-done)')).toHaveCount(0);
  await expect(page.locator('#err')).toHaveText('错误 0');
  expect(errors).toEqual([]);
});

test('blank-line and abbreviation chapters use contextual pronunciations after import', async ({
  page,
}) => {
  const errors = await boot(page);
  await importPrompt(
    page,
    '他了解了情况，最后了结了此事，却没完没了。',
    'chinese-sentences-full-blank',
  );
  const displayed = await page.locator('#target .bm-top-line .ch').allTextContents();
  expect(displayed.join('').replaceAll('\u00a0', ' ')).toBe(
    'ta liao jie le qing kuang ，zui hou liao jie le ci shi ，que mei wan mei liao 。',
  );
  await completeTypingFromDisplayedSteps(page);
  await expect(page.locator('#target')).toHaveClass(/ok/);
  await expect(page.locator('.p-char:not(.p-done)')).toHaveCount(0);

  await importPrompt(page, '银行行长重新归还', 'chinese-abbreviations');
  const abbreviated = await page.locator('#target .ch').allTextContents();
  expect(abbreviated.join('').replaceAll('\u00a0', ' ')).toBe('yh hz cx gh ');
  await page.keyboard.press('Shift');
  await page.keyboard.type('yh hz cx gh ');
  await expect(page.locator('#target')).toHaveClass(/ok/);
  await expect(page.locator('.p-char:not(.p-done)')).toHaveCount(0);
  await expect(page.locator('#err')).toHaveText('错误 0');
  expect(errors).toEqual([]);
});
