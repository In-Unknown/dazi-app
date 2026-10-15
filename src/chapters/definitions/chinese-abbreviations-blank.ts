import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-abbreviations-blank',
  compiler: 'prompt',
  title: '中文缩写 · 空行撰写',
  desc: '声母首字母缩写下方空行输入，词框选与字变绿联动',
  rounds: 15,
  isBlankLineMode: true,
  mode: 'abbrev',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const han = chineseOnly.length > 0 ? pick(chineseOnly) : pick(getSentences());
    return { prompt: han, mode: 'abbrev' };
  },
});
