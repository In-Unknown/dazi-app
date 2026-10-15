import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-abbreviations',
  compiler: 'prompt',
  title: '中文缩写',
  desc: '整词高亮框选，敲声母词内逐字变绿，按空格确认并跳词',
  rounds: 15,
  mode: 'abbrev',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const han = chineseOnly.length > 0 ? pick(chineseOnly) : pick(getSentences());
    return { prompt: han, mode: 'abbrev' };
  },
});
