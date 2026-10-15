export function sliceByPunct(text: string, minLen: number, punctRegex: RegExp) {
  if (!text || text.length <= minLen) return text;
  for (let i = minLen; i < text.length; i++) {
    if (punctRegex.test(text[i])) {
      return text.slice(0, i + 1);
    }
  }
  return text.slice(0, minLen + 20); // 兜底保护
}

export function sliceSentence(text: string) {
  return sliceByPunct(text, 30, /[，。！？；、,!?;.]/);
}

export function sliceParagraph(text: string) {
  return (
    sliceByPunct(text, 100, /[。！？；\n.!?]/) || sliceByPunct(text, 100, /[，。！？；、,!?;.\n]/)
  );
}

export function isHanzi(ch: string) {
  return /[\u4e00-\u9fa5]/.test(ch);
}

export function hasChinese(s: string) {
  return /[\u4e00-\u9fa5]/.test(s);
}

export function hasEnglish(s: string) {
  return /[a-zA-Z]/.test(s);
}

export const ALLOWED_RE =
  /[a-zA-Z0-9üÜ\u4e00-\u9fa5 .,;'\/\[\]\\\-=`~!@#$%^&*()_+{}|:"<>?\n⇪⇧，。、；：？！“”‘’《》【】（）—￥…]/;

export function sanitizeText(text: unknown) {
  if (!text) return '';
  let s = String(text);

  s = s.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00A0]/g, ' ');
  s = s.replace(/\u3000/g, ' ');
  s = s.replace(/\t/g, ' ');
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  const lines = s.split('\n').map((line) => {
    let cleaned = '';
    for (const ch of line) {
      if (ALLOWED_RE.test(ch)) cleaned += ch;
    }
    cleaned = cleaned.replace(/ {2,}/g, ' ');
    cleaned = cleaned.replace(/^ +| +$/g, '');
    return cleaned;
  });

  return lines.filter((l) => l.length > 0).join('\n');
}
