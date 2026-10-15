import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'mixed-pinyin-blank',
  compiler: 'prompt',
  title: '缩写 + 全拼 混合 · 空行撰写',
  desc: '混合词组缩写与全拼下方空行演练',
  rounds: 15,
  isBlankLineMode: true,
  mode: 'mixed-abbrev',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const han = chineseOnly.length > 0 ? pick(chineseOnly) : pick(getSentences());
    return { prompt: han, mode: 'mixed-abbrev' };
  },
});
