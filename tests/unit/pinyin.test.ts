import { afterEach, describe, expect, it, vi } from 'vitest';
import { wordPinyin } from '../../src/content/pinyin';
import { compilePrompt } from '../../src/features/typing/compiler';
import type { PromptMode } from '../../src/features/typing/types';

function pronunciations(text: string, mode: PromptMode = 'full') {
  const compiled = compilePrompt(text, mode);
  return compiled.charRefs.flatMap((element, index) => {
    const letters = compiled.items.filter(
      (step) =>
        step.type === 'char' &&
        step.promptCharIdx === index &&
        (step.promptAction === 'pinyin-letter' || step.promptAction === 'abbrev-char'),
    );
    return letters.length
      ? [
          {
            char: element.textContent,
            typed: letters.map((step) => (step.type === 'char' ? step.display : '')).join(''),
            abbreviated: letters[0].promptAction === 'abbrev-char',
          },
        ]
      : [];
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('contextual pronunciation in compiled typing tasks', () => {
  const screenshotText = '淑如又沉默了一会儿，然后略微提高了一点音量说道：';
  const screenshotPinyin =
    'shu ru you chen mo le yi hui er ran hou lüe wei ti gao le yi dian yin liang shuo dao';

  it('keeps context when the UI tokenizer separates 了 or starts a word with it', () => {
    const readings = pronunciations(screenshotText);
    expect(readings.map((r) => r.typed)).toEqual(screenshotPinyin.split(' '));
    expect(readings.filter((r) => r.char === '了').map((r) => r.typed)).toEqual(['le', 'le']);
  });

  it('also retains context without Intl.Segmenter', () => {
    vi.stubGlobal('Intl', Object.assign(Object.create(Intl), { Segmenter: undefined }));
    expect(pronunciations(screenshotText).map((r) => r.typed)).toEqual(screenshotPinyin.split(' '));
  });

  it('distinguishes particles from liao in the same imported sentence', () => {
    const text = '听了洛霜的话，他了解了情况，最后了结了此事，却没完没了。';
    expect(pronunciations(text).map((r) => r.typed)).toEqual(
      'ting le luo shuang de hua ta liao jie le qing kuang zui hou liao jie le ci shi que mei wan mei liao'.split(
        ' ',
      ),
    );
    expect(wordPinyin('不了了之')).toEqual(['bu', 'liao', 'liao', 'zhi']);
    expect(wordPinyin('受不了')).toEqual(['shou', 'bu', 'liao']);
    expect(wordPinyin('觉得')).toEqual(['jue', 'de']);
  });

  it.each<PromptMode>(['full', 'abbrev', 'mixed-abbrev'])(
    'uses the same contextual reading in %s mode',
    (mode) => {
      vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValue(0);
      const readings = pronunciations('银行行长重新归还', mode);
      const expected = ['yin', 'hang', 'hang', 'zhang', 'chong', 'xin', 'gui', 'huan'];
      expect(readings.map((r) => r.typed)).toEqual(
        expected.map((syllable, index) => (readings[index].abbreviated ? syllable[0] : syllable)),
      );
    },
  );

  it('keeps Hanzi mappings after English, digits, punctuation, spaces and line breaks', () => {
    const text = '听了 HTML 2026，女儿了解了。\nWindows：提高了一点音量，绿灯。';
    expect(pronunciations(text).map((r) => r.typed)).toEqual(
      'ting le nü er liao jie le ti gao le yi dian yin liang lü deng'.split(' '),
    );
    const compiled = compilePrompt(text, 'full');
    expect(compiled.items.filter((s) => s.type === 'nl')).toHaveLength(1);
    expect(compiled.items.filter((s) => s.type === 'caps-down')).toHaveLength(2);
    expect(compiled.items.filter((s) => s.type === 'char' && s.display === 'ü')).toEqual([
      expect.objectContaining({ baseKey: 'v', hint: 'v' }),
      expect.objectContaining({ baseKey: 'v', hint: 'v' }),
    ]);
    expect(compiled.items.filter((s) => s.promptAction === 'char-confirm')).toHaveLength(16);
  });
});
