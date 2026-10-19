import { pinyin } from 'pinyin-pro';
import { writeFileSync } from 'node:fs';

const toneSet = new Set(); // 带声调（数字）音节
const baseSet = new Set(); // 不带声调音节
let mappedChars = 0;
const polyphonic = new Map(); // 字 -> 读音数

for (let cp = 0x4e00; cp <= 0x9fff; cp++) {
  const ch = String.fromCodePoint(cp);
  let arr;
  try {
    // multiple:true 展开多音字的全部读音
    arr = pinyin(ch, { toneType: 'num', type: 'array', multiple: true });
  } catch {
    continue;
  }
  if (!arr || !arr.length) continue;
  const readings = arr.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const valid = [...new Set(readings.filter((r) => r && r !== ch))];
  if (!valid.length) continue;
  mappedChars++;
  if (valid.length > 1) polyphonic.set(ch, valid);
  for (const r of valid) {
    const m = r.match(/^([a-zü]+)([1-5])?$/);
    if (!m) continue;
    toneSet.add(r);
    baseSet.add(m[1]);
  }
}

console.log('有读音的字数:', mappedChars);
console.log('带声调音节种类(含多音字全部读音):', toneSet.size);
console.log('不带声调音节种类:', baseSet.size);
console.log('多音字数量(有>1读音):', polyphonic.size);

writeFileSync('scripts/syllables-with-tone.txt', [...toneSet].sort().join('\n'), 'utf8');

// 与 audio-cmn 的 1707 个文件对比：列出本地音频缺失的音节
console.log('音节清单已写出 scripts/syllables-with-tone.txt');
