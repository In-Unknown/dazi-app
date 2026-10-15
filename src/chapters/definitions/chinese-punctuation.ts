import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-punctuation',
  compiler: 'sequence',
  title: '中文标点 · 全角',
  desc: '系统从英文开局，必须先切入中文输入法才能敲打全角标点',
  rounds: 15,
  gen: () => {
    const puncts = [
      '，',
      '。',
      '、',
      '；',
      '：',
      '？',
      '！',
      '“',
      '”',
      '《',
      '》',
      '【',
      '】',
      '（',
      '）',
      '—',
      '￥',
    ];
    const n = randInt(2, 4);
    const picked = shuffle(puncts).slice(0, n);
    return { text: '⇧' + picked.join('') };
  },
});
