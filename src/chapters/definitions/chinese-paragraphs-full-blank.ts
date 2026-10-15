import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish, sliceParagraph } from '../../content/text';
import { pick, randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-paragraphs-full-blank',
  compiler: 'prompt',
  title: '中文段落 · 全拼 · 空行撰写',
  desc: '长篇拼音段落的空行盲打，汉字随空格确认实时变绿',
  rounds: 15,
  isBlankLineMode: true,
  mode: 'full',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const pool = chineseOnly.length > 0 ? chineseOnly : getSentences();
    let raw = pick(pool);
    if (raw.length < 100 && pool.length > 1) {
      const n = Math.min(randInt(4, 6), pool.length);
      raw = shuffle([...pool])
        .slice(0, n)
        .join('，');
    }
    const han = sliceParagraph(raw); // 超过100字在最近标点处结束
    return { prompt: han, mode: 'full' };
  },
});
