import type { SymbolAudioPool } from '../../audio/symbol-audio';

export interface PreparationOptions {
  mode: 'listen' | 'sequence';
  symbols: readonly string[];
  rounds: number;
  nextRoundMs: number;
  enabled: boolean;
  /** listen 模式使用的音频来源；sequence 模式不需要。 */
  audio?: SymbolAudioPool;
  /** 面向用户的符号称谓，仅影响文案；默认“字母”。 */
  label?: string;
  /** listen 模式标题后追加的一句说明，可选；默认不显示。 */
  promptNote?: string;
}

/** 通用符号校验：任意非空、无重复、无空白的符号序列。 */
export function validateSymbols(symbols: readonly string[]) {
  if (
    !symbols.length ||
    new Set(symbols).size !== symbols.length ||
    symbols.some((s) => !s || /\s/.test(s))
  )
    throw new Error('Expected unique non-empty symbols');
}

/** 字母专用校验：仍用于以 A–Z 为前提的章节。 */
export function validateAlphabet(symbols: readonly string[]) {
  if (
    !symbols.length ||
    new Set(symbols).size !== symbols.length ||
    symbols.some((s) => !/^[A-Z]$/.test(s))
  )
    throw new Error('Expected unique uppercase letters A–Z');
}

export function validatePreparation(options: PreparationOptions) {
  validateSymbols(options.symbols);
  if (options.mode === 'listen' && !options.audio)
    throw new Error('Listen preparation requires an audio pool');
  if (
    !Number.isInteger(options.rounds) ||
    options.rounds < 1 ||
    !Number.isFinite(options.nextRoundMs) ||
    options.nextRoundMs < 0
  )
    throw new Error('Invalid preparation rounds or timing');
}
