import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish, sliceParagraph } from '../../content/text';
import { pick, randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-paragraphs-full',
  compiler: 'prompt',
  title: '中文段落 · 全拼',
  desc: '长句拼成一段，标点前敲空格确认汉字，标点后直接打音节',
  rounds: 15,
  mode: 'full',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const pool = chineseOnly.length > 0 ? chineseOnly : getSentences();
    let raw = pick(pool);
    // 如果内置句子太短，拼接多句
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
