import type { TypingStep } from './types';
import { getRequiredIme, SYMBOL_MAP, isPunctChar } from '../../input/keymap';

export function expandSymbols(text: string) {
  const out: TypingStep[] = [];
  let simIme = 'en';

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (ch === '\n') {
      out.push({ type: 'nl' });
      i++;
      continue;
    }
    if (ch === ' ') {
      out.push({ type: 'sp' });
      i++;
      continue;
    }

    if (ch === '⇪') {
      out.push({ type: 'caps-down', color: 'orange', expected: 'CapsLock', hint: '按下Caps' });
      out.push({ type: 'caps-up', color: 'orange', expected: 'CapsLock', hint: '松开Caps' });
      i++;
      continue;
    }

    if (ch === '⇧') {
      out.push({
        type: 'shift-down',
        color: 'blue',
        expected: 'Shift',
        hint: '按下Shift',
        isImeToggle: true,
      });
      out.push({
        type: 'shift-up',
        color: 'blue',
        expected: 'Shift',
        hint: '松开Shift',
        isImeToggle: true,
      });
      simIme = simIme === 'en' ? 'zh' : 'en';
      if (text[i + 1] === ' ') i++;
      i++;
      continue;
    }

    // ü 韵母保护：物理键盘无 ü 键，统一映射为 v 键，屏幕仍显示 ü
    if (ch === 'ü') {
      out.push({ type: 'char', display: 'ü', hint: 'v', shift: false, baseKey: 'v' });
      i++;
      continue;
    }

    let reqIme = getRequiredIme(ch);
    if (reqIme && reqIme !== simIme) {
      out.push({
        type: 'shift-down',
        color: 'blue',
        expected: 'Shift',
        hint: '按下Shift',
        isImeToggle: true,
      });
      out.push({
        type: 'shift-up',
        color: 'blue',
        expected: 'Shift',
        hint: '松开Shift',
        isImeToggle: true,
      });
      simIme = reqIme;
    }

    if (ch === '…') {
      out.push({
        type: 'shift-down',
        color: 'blue',
        expected: 'Shift',
        hint: '按下Shift',
        isImeToggle: false,
      });
      out.push({
        type: 'char',
        display: '^',
        hint: '6',
        shift: true,
        baseKey: '6',
        requiredIme: 'zh',
      });
      out.push({
        type: 'shift-up',
        color: 'blue',
        expected: 'Shift',
        hint: '松开Shift',
        isImeToggle: false,
      });
      i++;
      continue;
    }

    const info = SYMBOL_MAP[ch];
    if (info) {
      if (info.shift === true) {
        out.push({
          type: 'shift-down',
          color: 'blue',
          expected: 'Shift',
          hint: '按下Shift',
          isImeToggle: false,
        });
      }
      out.push({
        type: 'char',
        display: ch,
        hint: info.hint,
        shift: info.shift,
        baseKey: info.baseKey,
      });
      if (info.shift === true) {
        out.push({
          type: 'shift-up',
          color: 'blue',
          expected: 'Shift',
          hint: '松开Shift',
          isImeToggle: false,
        });
      }
      i++;
      continue;
    }

    if (ch >= 'A' && ch <= 'Z') {
      out.push({ type: 'char', display: ch, hint: '', shift: null, baseKey: ch.toLowerCase() });
    } else if (ch >= 'a' && ch <= 'z') {
      out.push({ type: 'char', display: ch, hint: '', shift: null, baseKey: ch });
    } else if (ch >= '0' && ch <= '9') {
      out.push({ type: 'char', display: ch, hint: '', shift: false, baseKey: ch });
    } else {
      const code = ch.charCodeAt(0);
      if (code >= 32 && code < 127) {
        out.push({ type: 'char', display: ch, hint: '', shift: null, baseKey: ch.toLowerCase() });
      } else if (isPunctChar(ch)) {
        const normalized = ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        const fallback =
          normalized.length === 1 && normalized.charCodeAt(0) < 127
            ? normalized.toLowerCase()
            : '.';
        out.push({ type: 'char', display: ch, hint: fallback, shift: null, baseKey: fallback });
      }
    }
    i++;
  }
  return out;
}
