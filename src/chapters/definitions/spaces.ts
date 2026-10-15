import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, rndLower } from '../../core/random';

export default defineTypingChapter({
  id: 'spaces',
  compiler: 'sequence',
  title: '空格',
  desc: '用空格把字母组分开',
  rounds: 15,
  gen: () => {
    const n = randInt(2, 3),
      parts = [];
    for (let i = 0; i < n; i++) parts.push(rndLower(randInt(2, 4)));
    return { text: parts.join(' ') };
  },
});
