import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, rndLower, pick } from '../../core/random';

export default defineTypingChapter({
  id: 'punctuation-blank',
  compiler: 'sequence',
  title: '标点符号 · 空行撰写',
  desc: '英文半角标点符号的下方实打测试',
  rounds: 15,
  isBlankLineMode: true,
  gen: () => {
    const n = randInt(2, 3),
      parts = [];
    for (let i = 0; i < n; i++) parts.push(rndLower(randInt(2, 4)));
    let s = '';
    for (let i = 0; i < parts.length; i++) {
      s += parts[i];
      if (i === parts.length - 1) s += '.';
      else s += pick([',', '.', ';', "'"]) + ' ';
    }
    return { text: s };
  },
});
