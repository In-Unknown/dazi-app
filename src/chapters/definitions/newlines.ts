import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, rndLower } from '../../core/random';

export default defineTypingChapter({
  id: 'newlines',
  compiler: 'sequence',
  title: '回车换行',
  desc: '敲完一行后按 Enter 换行',
  rounds: 15,
  gen: () => {
    const n = randInt(2, 3),
      parts = [];
    for (let i = 0; i < n; i++) parts.push(rndLower(randInt(3, 6)));
    return { text: parts.join('\n') };
  },
});
