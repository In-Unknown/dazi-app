import { defineTypingChapter } from '../../features/typing/chapter';
import { rndUpper, randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'uppercase-strings',
  compiler: 'sequence',
  title: '大写字母串',
  desc: '按顺序敲出这几个大写字母（默认大写状态）',
  rounds: 15,
  defaultCaps: true,
  gen: () => ({ text: rndUpper(randInt(2, 4)) }),
});
