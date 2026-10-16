import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createApplication } from '../../src/app/controller';
import { createUI } from '../../src/ui/elements';
import pinyinSingleFinals from '../../src/chapters/definitions/pinyin-single-finals';
import letterListening from '../../src/chapters/definitions/letter-listening';
import { SINGLE_FINALS } from '../../src/data/pinyin';

vi.mock('../../src/audio/feedback', () => ({
  playSuccessSound: vi.fn(),
  playKeySuccessSound: vi.fn(),
  playErrorSound: vi.fn(),
}));
vi.mock('../../src/audio/pronunciation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/audio/pronunciation')>();
  return { ...actual, playLetterAudio: vi.fn(), stopLetterAudio: vi.fn() };
});
vi.mock('../../src/audio/symbol-audio', () => ({
  playSymbolAudio: vi.fn(),
  stopSymbolAudio: vi.fn(),
  prepareSymbolAudio: vi.fn(() => Promise.resolve()),
  symbolAudioDurationMs: vi.fn(() => null),
}));

const cleanups: (() => void)[] = [];
beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  document.body.innerHTML = '';
});
afterEach(() => {
  cleanups.splice(0).forEach((clean) => clean());
  vi.useRealTimers();
});
function boot(chapters: Parameters<typeof createApplication>[0]) {
  const app = createApplication(chapters, createUI());
  cleanups.push(app.dispose);
  app.startChapter(0);
  return app;
}
const click = (selector: string) => document.querySelector<HTMLButtonElement>(selector)!.click();
const space = () => new KeyboardEvent('keydown', { code: 'Space' });
const tileButtons = () => [...document.querySelectorAll<HTMLButtonElement>('button.alphabet-tile')];

describe('pinyin single finals chapter', () => {
  it('shows all six finals in the preparation board and lets each be listened to', () => {
    const app = boot([pinyinSingleFinals]);
    const tiles = [...document.querySelectorAll<HTMLElement>('.alphabet-tile')];
    expect(tiles.map((t) => t.dataset.letter)).toEqual([...SINGLE_FINALS]);
    expect(document.querySelectorAll('button.alphabet-tile')).toHaveLength(6);
    click('.alphabet-tile[data-letter="ü"]');
    expect(document.querySelector('.alphabet-tile[data-letter="ü"]')!.classList).toContain('heard');
    app.dispose();
    cleanups.splice(0);
  });

  it('keeps audio tiles disabled and the continue button off until the guided pass completes', () => {
    const app = boot([pinyinSingleFinals]);
    const cont = () => document.querySelector<HTMLButtonElement>('#lessonContinue')!;
    expect(cont().disabled).toBe(true);
    expect(tileButtons().every((b) => !b.disabled)).toBe(true);
    app.keyDown(space());
    // 引导播放期间：所有音频方块禁用，继续按钮仍灰。
    expect(tileButtons().every((b) => b.disabled)).toBe(true);
    expect(cont().disabled).toBe(true);
    // 正序 + 倒序 + 两遍随机 = 24 段；每段回退 700ms 时长 + 350ms 停顿。
    vi.advanceTimersByTime(1050 * 24 + 100);
    expect(tileButtons().every((b) => !b.disabled)).toBe(true);
    expect(cont().disabled).toBe(false);
    app.dispose();
    cleanups.splice(0);
  });

  it("keeps each chapter's mastery data isolated", () => {
    // 拼音章使用韵母键，字母章使用大写字母键；两章数据互不可见。
    const app = boot([pinyinSingleFinals, letterListening]);
    const pinyinChapter = app.snapshot().mastery(0)!;
    const letterChapter = app.snapshot().mastery(1)!;
    expect(pinyinChapter.keys).toEqual([...SINGLE_FINALS]);
    expect(pinyinChapter.scores).toEqual({});
    expect(letterChapter.scores).toEqual({});
    // 字母章键为大写字母，绝不含拼音韵母。
    expect(letterChapter.keys).not.toContain('ü');
    app.dispose();
    cleanups.splice(0);
  });
});
