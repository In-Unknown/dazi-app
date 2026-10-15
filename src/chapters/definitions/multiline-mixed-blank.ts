import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick, randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'multiline-mixed-blank',
  compiler: 'prompt',
  title: '最终 · 多行混合 · 空行撰写',
  desc: '最终综合大考：多行盲打，敲击 Enter 真实换行光标折返',
  rounds: 15,
  isBlankLineMode: true,
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
