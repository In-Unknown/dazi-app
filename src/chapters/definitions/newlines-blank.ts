import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, rndLower } from '../../core/random';

export default defineTypingChapter({
  id: 'newlines-blank',
  compiler: 'sequence',
  title: '回车换行 · 空行撰写',
  desc: '上方为参考行，下方输入行不显示换行符，按 Enter 光标自动跳转至下一行',
  rounds: 15,
  isBlankLineMode: true,
  gen: () => {
    const n = randInt(2, 3),
      parts = [];
    for (let i = 0; i < n; i++) parts.push(rndLower(randInt(3, 6)));
    return { text: parts.join('\n') };
  },
});
