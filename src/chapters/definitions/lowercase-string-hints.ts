import { defineTypingChapter } from '../../features/typing/chapter';
import { rndLower, randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'lowercase-string-hints',
  compiler: 'sequence',
  title: '小写字母串 · 带提示',
  desc: '下方蓝色字符串是键盘上对应的大写键',
  rounds: 35,
  gen: () => {
    const s = rndLower(randInt(2, 4));
    return { text: s, hint: s.toUpperCase() };
  },
});
