import { shuffle, randInt, pick } from '../../core/random';
import { ALL_LETTERS } from '../../data/alphabet';

export function makeLetterList(count: number) {
  const base = shuffle([...ALL_LETTERS]);
  while (base.length < count) {
    base.push(ALL_LETTERS[Math.floor(Math.random() * 26)]);
  }
  return base.slice(0, count);
}

export function genCaseMix(
  opts: {
    includeDigits?: boolean;
    includePunct?: boolean;
    includeSpace?: boolean;
    includeNL?: boolean;
  } = {},
) {
  opts = opts || {};
  const includeDigits = !!opts.includeDigits;
  const includePunct = !!opts.includePunct;
  const includeSpace = !!opts.includeSpace;
  const includeNL = !!opts.includeNL;

  let result = '';
  let capsOn = false;
  const n = includeNL ? randInt(6, 12) : randInt(2, 4);
  let hasNewline = false;

  for (let i = 0; i < n; i++) {
    const wordLen = randInt(2, 4);
    const wantUpper = Math.random() < 0.45;
    if (wantUpper !== capsOn) {
      result += '⇪';
      capsOn = wantUpper;
    }
    for (let j = 0; j < wordLen; j++) {
      if (includeDigits && Math.random() < 0.25) {
        result += String(randInt(0, 9));
      } else {
        const c = String.fromCharCode(97 + randInt(0, 25));
        result += capsOn ? c.toUpperCase() : c;
      }
    }
    if (i < n - 1) {
      const r = Math.random();
      if (includeNL && (r < 0.3 || (!hasNewline && i === Math.floor(n / 2)))) {
        if (includePunct && Math.random() < 0.5) result += pick([',', '.', ';']);
        result += '\n';
        hasNewline = true;
      } else if (includePunct && r < 0.6) {
        result += pick([',', '.', ';', ':']) + ' ';
      } else if (includeSpace) {
        result += ' ';
      } else {
        result += ' ';
      }
    } else {
      if (includePunct) result += '.';
    }
  }
  return { text: result };
}
