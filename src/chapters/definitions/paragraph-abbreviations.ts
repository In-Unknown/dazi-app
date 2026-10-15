import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'paragraph-abbreviations',
  compiler: 'prompt',
  title: '中文段落 · 缩写',
  desc: '整段快速声母缩写录入，按空格跳词推进',
  rounds: 15,
  mode: 'abbrev',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const pool = chineseOnly.length > 0 ? chineseOnly : getSentences();
    const n = Math.min(randInt(3, 4), pool.length);
    const selected = shuffle([...pool]).slice(0, n);
    const han = selected.join('，');
    return { prompt: han, mode: 'abbrev' };
  },
});
