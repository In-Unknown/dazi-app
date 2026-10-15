import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, shuffle } from '../../core/random';

export default defineTypingChapter({
  id: 'chinese-punctuation-blank',
  compiler: 'sequence',
  title: '中文标点 · 全角 · 空行撰写',
  desc: '上方展示切换与按键指南，下方实打出中文标点',
  rounds: 15,
  isBlankLineMode: true,
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
