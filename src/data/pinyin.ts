/** 单韵母：显示用 ü（键盘按 v）。顺序与第 1 章“逐个试听”一致。 */
export const SINGLE_FINALS = ['a', 'o', 'e', 'i', 'u', 'ü'] as const;

/** 21 个传统声母（不含 y、w）。 */
export const INITIALS = [
  'b',
  'p',
  'm',
  'f',
  'd',
  't',
  'n',
  'l',
  'g',
  'k',
  'h',
  'j',
  'q',
  'x',
  'zh',
  'ch',
  'sh',
  'r',
  'z',
  'c',
  's',
] as const;

/** 13 个复韵母。üe 显示为 üe，音频按 ve 命名。 */
export const COMPOUND_FINALS = [
  'ai',
  'ei',
  'ao',
  'ou',
  'ia',
  'ie',
  'ua',
  'uo',
  'üe',
  'iao',
  'iou',
  'uai',
  'uei',
] as const;

/** 16 个鼻韵母。ün 显示为 ün，音频按 vn 命名。 */
export const NASAL_FINALS = [
  'an',
  'en',
  'in',
  'un',
  'ün',
  'ang',
  'eng',
  'ing',
  'ong',
  'ian',
  'uan',
  'üan',
  'iang',
  'uang',
  'iong',
  'ueng',
] as const;

/** 混合复习：合并前四章全部音素（单韵母→声母→复韵母→鼻韵母）。 */
export const MIXED_REVIEW = [...SINGLE_FINALS, ...INITIALS, ...COMPOUND_FINALS, ...NASAL_FINALS];

/** 单韵母易混对：口型/舌位相近。 */
export const SINGLE_FINALS_CONFUSABLE: readonly (readonly string[])[] = [
  ['a', 'o'],
  ['o', 'e'],
  ['e', 'i'],
  ['i', 'u'],
  ['u', 'ü'],
];

/** 声母易混对：送气与否、平舌与翘舌、发音部位相近。 */
export const INITIALS_CONFUSABLE: readonly (readonly string[])[] = [
  ['b', 'p'],
  ['d', 't'],
  ['g', 'k'],
  ['j', 'q'],
  ['zh', 'ch'],
  ['z', 'c'],
  ['zh', 'z'],
  ['ch', 'c'],
  ['sh', 's'],
  ['n', 'l'],
  ['f', 'h'],
  ['m', 'n'],
  ['r', 'l'],
];

/** 复韵母易混对：韵腹或韵尾相近。 */
export const COMPOUND_FINALS_CONFUSABLE: readonly (readonly string[])[] = [
  ['ai', 'ei'],
  ['ao', 'ou'],
  ['ia', 'ie'],
  ['ua', 'uo'],
  ['iao', 'iou'],
  ['uai', 'uei'],
];

/** 鼻韵母易混对：前鼻音与后鼻音成对。 */
export const NASAL_FINALS_CONFUSABLE: readonly (readonly string[])[] = [
  ['an', 'ang'],
  ['en', 'eng'],
  ['in', 'ing'],
  ['ian', 'iang'],
  ['uan', 'uang'],
  ['un', 'ün'],
];

/** 混合复习易混对：合并前四章全部易混对。 */
export const PINYIN_MIXED_CONFUSABLE: readonly (readonly string[])[] = [
  ...SINGLE_FINALS_CONFUSABLE,
  ...INITIALS_CONFUSABLE,
  ...COMPOUND_FINALS_CONFUSABLE,
  ...NASAL_FINALS_CONFUSABLE,
];
