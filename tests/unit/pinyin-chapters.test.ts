import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CH } from '../../src/chapters/catalog';
import {
  SINGLE_FINALS,
  INITIALS,
  COMPOUND_FINALS,
  NASAL_FINALS,
  MIXED_REVIEW,
} from '../../src/data/pinyin';

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

beforeEach(() => {
  document.body.innerHTML = '';
});
afterEach(() => {
  vi.useRealTimers();
});

const byId = (id: string) => CH.find((c) => c.id === id)!;

/** 从章节策略中取出熟练度键（拼音各章的键就是其音素符号）。 */
const keysOf = (id: string) => {
  const policy = byId(id).progress;
  if (policy.type !== 'mastery') throw new Error('expected mastery policy');
  return [...policy.keys];
};

describe('pinyin listening chapters', () => {
  it('registers all five pinyin chapters in order before the Chinese sentence chapters', () => {
    const ids = CH.map((c) => c.id);
    const order = [
      'pinyin-single-finals',
      'pinyin-initials',
      'pinyin-compound-finals',
      'pinyin-nasal-finals',
      'pinyin-mixed-review',
    ];
    for (const id of order) expect(ids).toContain(id);
    for (let i = 1; i < order.length; i++)
      expect(ids.indexOf(order[i - 1])).toBeLessThan(ids.indexOf(order[i]));
    expect(ids.indexOf('pinyin-mixed-review')).toBeLessThan(ids.indexOf('chinese-sentences-full'));
  });

  it('uses the correct symbol set and per-symbol mastery keys for each chapter', () => {
    expect(keysOf('pinyin-single-finals')).toEqual([...SINGLE_FINALS]);
    expect(keysOf('pinyin-initials')).toEqual([...INITIALS]);
    expect(keysOf('pinyin-compound-finals')).toEqual([...COMPOUND_FINALS]);
    expect(keysOf('pinyin-nasal-finals')).toEqual([...NASAL_FINALS]);
    expect(keysOf('pinyin-mixed-review')).toEqual([...MIXED_REVIEW]);
    // 混合复习覆盖四类，共 56 个互不重复的音素。
    expect(MIXED_REVIEW).toHaveLength(56);
    expect(new Set(MIXED_REVIEW).size).toBe(56);
    expect(MIXED_REVIEW).toContain('zh');
    expect(MIXED_REVIEW).toContain('üe');
    expect(MIXED_REVIEW).toContain('ang');
  });
});
