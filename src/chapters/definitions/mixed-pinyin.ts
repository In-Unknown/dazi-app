import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'mixed-pinyin',
  compiler: 'prompt',
  title: '缩写 + 全拼 混合',
  desc: '全拼与缩写混合输入，单源决定归属，彻底杜绝混拼错位',
  rounds: 15,
  mode: 'mixed-abbrev',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const han = chineseOnly.length > 0 ? pick(chineseOnly) : pick(getSentences());
    return { prompt: han, mode: 'mixed-abbrev' };
  },
});
