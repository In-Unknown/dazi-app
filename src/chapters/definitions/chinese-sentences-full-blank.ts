import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish, sliceSentence } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-sentences-full-blank',
  compiler: 'prompt',
  title: '中文句子 · 全拼 · 空行撰写',
  desc: '下方空行输入，上方汉字随空格确认实时变绿',
  rounds: 15,
  isBlankLineMode: true,
  mode: 'full',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const raw = chineseOnly.length > 0 ? pick(chineseOnly) : pick(getSentences());
    const han = sliceSentence(raw); // 超过30字在最近标点处结束
    return { prompt: han, mode: 'full' };
  },
});
