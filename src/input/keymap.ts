export const CODE_MAP: Record<string, string> = {
  Space: ' ',
  Enter: 'Enter',
  NumpadEnter: 'Enter',
  Comma: ',',
  Period: '.',
  Semicolon: ';',
  Quote: "'",
  Slash: '/',
  Backslash: '\\',
  BracketLeft: '[',
  BracketRight: ']',
  Minus: '-',
  Equal: '=',
  Backquote: '`',
};

export function codeToChar(code: string) {
  if (code === 'CapsLock') return 'CapsLock';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  if (code.startsWith('Key')) return code.slice(3).toLowerCase();
  if (code.startsWith('Digit')) return code.slice(5);
  return CODE_MAP[code] ?? null;
}

export const SYMBOL_MAP: Record<string, { hint: string; shift: boolean; baseKey: string }> = {
  '~': { hint: '`', shift: true, baseKey: '`' },
  '!': { hint: '1', shift: true, baseKey: '1' },
  '@': { hint: '2', shift: true, baseKey: '2' },
  '#': { hint: '3', shift: true, baseKey: '3' },
  $: { hint: '4', shift: true, baseKey: '4' },
  '%': { hint: '5', shift: true, baseKey: '5' },
  '^': { hint: '6', shift: true, baseKey: '6' },
  '&': { hint: '7', shift: true, baseKey: '7' },
  '*': { hint: '8', shift: true, baseKey: '8' },
  '(': { hint: '9', shift: true, baseKey: '9' },
  ')': { hint: '0', shift: true, baseKey: '0' },
  _: { hint: '-', shift: true, baseKey: '-' },
  '+': { hint: '=', shift: true, baseKey: '=' },
  '{': { hint: '[', shift: true, baseKey: '[' },
  '}': { hint: ']', shift: true, baseKey: ']' },
  '|': { hint: '\\', shift: true, baseKey: '\\' },
  ':': { hint: ';', shift: true, baseKey: ';' },
  '"': { hint: "'", shift: true, baseKey: "'" },
  '<': { hint: ',', shift: true, baseKey: ',' },
  '>': { hint: '.', shift: true, baseKey: '.' },
  '?': { hint: '/', shift: true, baseKey: '/' },

  ',': { hint: ',', shift: false, baseKey: ',' },
  '.': { hint: '.', shift: false, baseKey: '.' },
  '/': { hint: '/', shift: false, baseKey: '/' },
  ';': { hint: ';', shift: false, baseKey: ';' },
  "'": { hint: "'", shift: false, baseKey: "'" },
  '[': { hint: '[', shift: false, baseKey: '[' },
  ']': { hint: ']', shift: false, baseKey: ']' },
  '-': { hint: '-', shift: false, baseKey: '-' },
  '=': { hint: '=', shift: false, baseKey: '=' },
  '`': { hint: '`', shift: false, baseKey: '`' },
  '\\': { hint: '\\', shift: false, baseKey: '\\' },

  '，': { hint: ',', shift: false, baseKey: ',' },
  '。': { hint: '.', shift: false, baseKey: '.' },
  '、': { hint: '\\', shift: false, baseKey: '\\' },
  '；': { hint: ';', shift: false, baseKey: ';' },
  '：': { hint: ';', shift: true, baseKey: ';' },
  '？': { hint: '/', shift: true, baseKey: '/' },
  '！': { hint: '1', shift: true, baseKey: '1' },
  '“': { hint: "'", shift: true, baseKey: "'" },
  '”': { hint: "'", shift: true, baseKey: "'" },
  '‘': { hint: "'", shift: false, baseKey: "'" },
  '’': { hint: "'", shift: false, baseKey: "'" },
  '《': { hint: ',', shift: true, baseKey: ',' },
  '》': { hint: '.', shift: true, baseKey: '.' },
  '【': { hint: '[', shift: false, baseKey: '[' },
  '】': { hint: ']', shift: false, baseKey: ']' },
  '（': { hint: '9', shift: true, baseKey: '9' },
  '）': { hint: '0', shift: true, baseKey: '0' },
  '—': { hint: '-', shift: true, baseKey: '-' },
  '￥': { hint: '4', shift: true, baseKey: '4' },
};

export function isPunctChar(ch: string) {
  if (!ch) return false;
  const cp = ch.codePointAt(0)!;
  if (cp >= 0x2000 && cp <= 0x206f) return true;
  if (cp >= 0x3000 && cp <= 0x303f) return true;
  if (cp >= 0xff00 && cp <= 0xffef) return true;
  if (
    (cp >= 0x21 && cp <= 0x2f) ||
    (cp >= 0x3a && cp <= 0x40) ||
    (cp >= 0x5b && cp <= 0x60) ||
    (cp >= 0x7b && cp <= 0x7e)
  )
    return true;
  return false;
}

export function getRequiredIme(ch: string): 'en' | 'zh' | null {
  if ('，。、；：？！“”‘’《》【】（）—￥…'.includes(ch)) return 'zh';
  if ('~!@#$%^&*()_+{}|:"<>?,./;\'[]\\-=`'.includes(ch)) return 'en';
  return null;
}
