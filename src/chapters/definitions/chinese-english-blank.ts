import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-english-blank',
  compiler: 'prompt',
  title: '中英切换 · 空行撰写',
  desc: '上方显示中英切换指令，下方空行只显示实际录入文本',
  rounds: 15,
  isBlankLineMode: true,
  mode: 'mixed',
  gen: () => {
    const mixed = getSentences().filter((s) => hasChinese(s) && hasEnglish(s));
    const han = mixed.length > 0 ? pick(mixed) : '我喜欢 Python 编程';
    return { prompt: han, mode: 'mixed' };
  },
});
