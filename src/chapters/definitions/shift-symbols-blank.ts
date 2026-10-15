import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'shift-symbols-blank',
  compiler: 'sequence',
  title: '符号 · Shift 组合 · 空行撰写',
  desc: '上方显示 Shift 指南，下方仅显示最终敲出的符号',
  rounds: 15,
  isBlankLineMode: true,
  gen: () => {
    const symbols = [
      '~',
      '!',
      '@',
      '#',
      '$',
      '%',
      '^',
      '&',
      '*',
      '(',
      ')',
      '_',
      '+',
      '{',
      '}',
      '|',
      ':',
      '"',
      '<',
      '>',
      '?',
    ];
    const n = randInt(2, 4);
    const picked = shuffle(symbols).slice(0, n);
    return { text: picked.join('') };
  },
});
