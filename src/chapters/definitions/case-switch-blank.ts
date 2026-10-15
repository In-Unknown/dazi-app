import { defineTypingChapter } from '../../features/typing/chapter';
import { genCaseMix } from '../../features/typing/generators';

export default defineTypingChapter({
  id: 'case-switch-blank',
  compiler: 'sequence',
  title: '大小写切换 · 空行撰写',
  desc: '上方显示 CapsLock 操作指引，下方只呈现敲出的大小写字符',
  rounds: 15,
  isBlankLineMode: true,
  gen: () => genCaseMix({}),
});
