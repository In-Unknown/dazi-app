import { defineTypingChapter } from '../../features/typing/chapter';
import { getSentences } from '../../content/corpus';
import { hasChinese, hasEnglish } from '../../content/text';
import { pick } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-english',
  compiler: 'prompt',
  title: '中英切换',
  desc: '真实中英频繁切换：英文大写自动推导Shift，英文词后绝无多余空格',
  rounds: 15,
  mode: 'mixed',
  gen: () => {
    const mixed = getSentences().filter((s) => hasChinese(s) && hasEnglish(s));
    const han = mixed.length > 0 ? pick(mixed) : '我喜欢 Python 编程';
    return { prompt: han, mode: 'mixed' };
  },
});
