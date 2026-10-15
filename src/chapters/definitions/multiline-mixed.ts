import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick, randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'multiline-mixed',
  compiler: 'prompt',
  title: '最终 · 多行混合',
  desc: '中文 + 英文 + 数字 + 换行，中文提示与拼音 1:1 真多行对齐',
  rounds: 15,
  mode: 'multiline',
  gen: () => {
    const chineseOnly = getSentences().filter((s) => hasChinese(s) && !hasEnglish(s));
    const mixed = getSentences().filter((s) => hasChinese(s) && hasEnglish(s));
    const pool = chineseOnly.length > 0 ? chineseOnly : getSentences();

    const prompts = [];
    if (pool.length > 0) prompts.push(pick(pool) + '，');
    if (pool.length > 0) prompts.push(pick(pool) + '，');
    if (mixed.length > 0) prompts.push(pick(mixed) + '，');
    if (pool.length > 0) prompts.push(pick(pool) + ' ' + randInt(100, 999) + '。');

    const prompt = prompts.filter((p) => p && p.trim()).join('\n');
    return { prompt, mode: 'multiline' };
  },
});
