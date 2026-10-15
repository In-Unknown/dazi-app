import { describe, expect, it } from 'vitest';
import { CH } from '../../src/chapters/catalog';
import { assembleChapters } from '../../src/chapters/schema';
import { defineTypingChapter, isTypingChapter } from '../../src/features/typing/chapter';
import { compilePrompt } from '../../src/features/typing/compiler';
import { expandSymbols } from '../../src/features/typing/sequence';
import { sanitizeText } from '../../src/content/text';
import { wordPinyin } from '../../src/content/pinyin';

describe('chapter catalog and content', () => {
  it('contains all 35 chapters and all generators produce usable input', () => {
    expect(CH).toHaveLength(35);
    for (const chapter of CH.filter(isTypingChapter)) {
      const rounds = chapter.buildList?.() ?? [chapter.gen!()];
      expect(rounds.length).toBeGreaterThan(0);
      for (const round of rounds) {
        const steps =
          chapter.compiler === 'prompt'
            ? compilePrompt(round.prompt!, round.mode ?? chapter.mode ?? 'full').items
            : expandSymbols(sanitizeText(round.text));
        expect(steps.length, chapter.id).toBeGreaterThan(0);
        expect(steps.every((step) => step.type !== 'char' || !!step.baseKey)).toBe(true);
      }
    }
  });
  it('reorders and disables chapters without changing their compiler or identity', () => {
    const prompt = CH.filter(isTypingChapter).find((ch) => ch.compiler === 'prompt')!;
    const reordered = assembleChapters(CH, [prompt.id, CH[0].id]);
    expect(reordered).toEqual([prompt, CH[0]]);
    expect(isTypingChapter(reordered[0]) && reordered[0].compiler).toBe('prompt');
    expect(() => assembleChapters(CH, ['missing'])).toThrow('Unknown');
    expect(() => assembleChapters(CH, [CH[0].id, CH[0].id])).toThrow('Duplicate');
    expect(() => assembleChapters([...CH, CH[0]], [CH[0].id])).toThrow('Duplicate');
    expect(() => assembleChapters(CH, [])).toThrow();
    expect(() =>
      defineTypingChapter({ ...prompt, gen: undefined, buildList: undefined }),
    ).toThrow();
  });
  it('preserves Caps/Shift press and release steps, ü, punctuation and IME requirements', () => {
    const steps = expandSymbols('⇪AB⇪cd⇧，⇧.!…ü');
    expect(steps.filter((s) => s.type === 'caps-down')).toHaveLength(2);
    expect(steps.filter((s) => s.type === 'shift-down').length).toBe(5);
    expect(steps.find((s) => s.type === 'char' && s.display === '^')).toMatchObject({
      baseKey: '6',
      requiredIme: 'zh',
    });
    expect(steps.at(-1)).toMatchObject({ display: 'ü', baseKey: 'v' });
  });
  it('retains word pronunciation, abbreviation confirmations, multiline and English case', () => {
    expect(wordPinyin('觉得')).toEqual(['jue', 'de']);
    const full = compilePrompt('你好 HTML\nWindows，女', 'full');
    expect(full.items.some((s) => s.type === 'nl')).toBe(true);
    expect(full.items.some((s) => s.type === 'caps-down')).toBe(true);
    expect(
      full.items.some((s) => s.type === 'char' && s.display === 'ü' && s.baseKey === 'v'),
    ).toBe(true);
    const abbrev = compilePrompt('你好', 'abbrev');
    expect(abbrev.items.at(-1)).toMatchObject({ type: 'sp', promptAction: 'word-confirm' });
    expect(abbrev.charRefs).toHaveLength(2);
  });
});
