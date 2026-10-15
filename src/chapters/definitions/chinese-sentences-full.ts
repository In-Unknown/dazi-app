import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish, sliceSentence } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-sentences-full',
  compiler: 'prompt',
  title: '中文句子 · 全拼',
  desc: '开局切入中文，汉字实时联动变绿，空格确认汉字上屏',
  rounds: 15,
  mode: 'full',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const raw = chineseOnly.length > 0 ? pick(chineseOnly) : pick(getSentences());
    const han = sliceSentence(raw); // 超过30字在最近标点处结束
    return { prompt: han, mode: 'full' };
  },
});
