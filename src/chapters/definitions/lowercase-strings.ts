import { defineTypingChapter } from '../../features/typing/chapter';
import { rndLower, randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'lowercase-strings',
  compiler: 'sequence',
  title: '小写字母串',
  desc: '靠衬线字形直接找键（l 有脚，i 有点）',
  rounds: 30,
  gen: () => ({ text: rndLower(randInt(2, 4)) }),
});
