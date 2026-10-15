import { defineTypingChapter } from '../../features/typing/chapter';
import { makeLetterList } from '../../features/typing/generators';

export default defineTypingChapter({
  id: 'uppercase-letters',
  compiler: 'sequence',
  title: '大写字母',
  desc: '按屏幕上的字母，不需要按 Shift（默认大写状态）',
  rounds: 30,
  defaultCaps: true,
  buildList: () => makeLetterList(30).map((l) => ({ text: l })),
});
