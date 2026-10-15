import { defineTypingChapter } from '../../features/typing/chapter';
import { genCaseMix } from '../../features/typing/generators';

export default defineTypingChapter({
  id: 'mixed-paragraphs',
  compiler: 'sequence',
  title: '混合段落',
  desc: '数字、标点、空格、换行、大小写全混在一起',
  rounds: 15,
  gen: () =>
    genCaseMix({
      includeDigits: true,
      includePunct: true,
      includeSpace: true,
      includeNL: true,
    }),
});
