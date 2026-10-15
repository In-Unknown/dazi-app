import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'number-keys',
  compiler: 'sequence',
  title: '数字键',
  desc: '主键盘上方的数字行',
  rounds: 15,
  gen: () => {
    const n = randInt(1, 3);
    let s = '';
    for (let i = 0; i < n; i++) s += randInt(0, 9);
    return { text: s };
  },
});
