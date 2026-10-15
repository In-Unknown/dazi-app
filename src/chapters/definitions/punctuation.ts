import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt, rndLower, pick } from '../../core/random';

export default defineTypingChapter({
  id: 'punctuation',
  compiler: 'sequence',
  title: '标点符号',
  desc: '英文半角逗号、句号、分号、撇号',
  rounds: 15,
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
