import { defineTypingChapter } from '../../features/typing/chapter';
import { genCaseMix } from '../../features/typing/generators';

export default defineTypingChapter({
  id: 'mixed-paragraphs-blank',
  compiler: 'sequence',
  title: '混合段落 · 空行撰写',
  desc: '多元素混合文本的下方实打测试',
  rounds: 15,
  isBlankLineMode: true,
  gen: () =>
    genCaseMix({
      includeDigits: true,
      includePunct: true,
      includeSpace: true,
      includeNL: true,
    }),
});
