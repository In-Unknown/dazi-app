import { defineTypingChapter } from '../../features/typing/chapter';
import { genCaseMix } from '../../features/typing/generators';

export default defineTypingChapter({
  id: 'case-switch',
  compiler: 'sequence',
  title: '大小写切换',
  desc: '看到橙色箭头就按一下 CapsLock，再按对应的大小写字母',
  rounds: 15,
  gen: () => genCaseMix({}),
});
