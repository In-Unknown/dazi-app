/** 21 个传统声母（不含 y/w），按长度降序匹配（先 zh/ch/sh）。 */
const INITIALS = [
  'zh', 'ch', 'sh',
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'r', 'z', 'c', 's',
] as const;

/** 韵母表（与 24 复韵母、25 鼻韵母两章一致）。 */
const FINALS = [
  'a', 'o', 'e', 'i', 'u', 'ü',
  'ai', 'ei', 'ao', 'ou', 'ia', 'ie', 'ua', 'uo', 'üe', 'iao', 'iou', 'uai', 'uei',
  'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong',
  'ian', 'uan', 'üan', 'iang', 'uang', 'iong', 'ueng',
] as const;

/** y/w 开头（零声母）的书写形式 → 规范韵母。y/w 是隔音字母，不是声母。 */
const ZERO_INITIAL: Record<string, string> = {
  yi: 'i', ya: 'ia', ye: 'ie', yao: 'iao', you: 'iou', yan: 'ian', yin: 'in',
  yang: 'iang', ying: 'ing', yong: 'iong',
  yu: 'ü', yue: 'üe', yuan: 'üan', yun: 'ün',
  wu: 'u', wa: 'ua', wo: 'uo', wai: 'uai', wei: 'uei', wan: 'uan',
  wen: 'un', wang: 'uang', weng: 'ueng',
};

/** 带声母时的缩写书写 → 规范韵母。 */
const ABBREV: Record<string, string> = { iu: 'iou', ui: 'uei' };

export interface SyllableParts {
  /** 声母；零声母为 ''。 */
  initial: string;
  /** 规范韵母。 */
  final: string;
}

/**
 * 把规范写法的基本音节（无调）拆成声母 + 韵母。
 * 规则：y/w 视为零声母；j/q/x 后的 u 还原为 ü；iu/ui 展开为 iou/uei。
 * 无法识别时返回 null（如 er 等特殊音节）。
 */
export function decomposeSyllable(base: string): SyllableParts | null {
  if (ZERO_INITIAL[base]) return { initial: '', final: ZERO_INITIAL[base] };
  if ((FINALS as readonly string[]).includes(base)) return { initial: '', final: base };
  for (const ini of INITIALS) {
    if (!base.startsWith(ini)) continue;
    let rest = base.slice(ini.length);
    if ((ini === 'j' || ini === 'q' || ini === 'x') && rest.startsWith('u'))
      rest = 'ü' + rest.slice(1);
    rest = ABBREV[rest] ?? rest;
    if ((FINALS as readonly string[]).includes(rest)) return { initial: ini, final: rest };
  }
  return null;
}
