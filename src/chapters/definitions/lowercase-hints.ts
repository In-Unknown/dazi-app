import { defineTypingChapter } from '../../features/typing/chapter';
import { makeLetterList } from '../../features/typing/generators';

export default defineTypingChapter({
  id: 'lowercase-hints',
  compiler: 'sequence',
  title: '小写字母 · 带提示',
  desc: '下方蓝色字母是键盘上对应的大写键（覆盖 26 个字母）',
  rounds: 75,
  buildList: () =>
    makeLetterList(75).map((l) => ({
      text: l.toLowerCase(),
      hint: l,
    })),
});
