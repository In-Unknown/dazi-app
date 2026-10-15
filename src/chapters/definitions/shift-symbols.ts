import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'shift-symbols',
  compiler: 'sequence',
  title: '符号 · Shift 组合',
  desc: '【重要】实心箭头代表必须按下Shift，虚线箭头代表必须松开Shift',
  rounds: 15,
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
