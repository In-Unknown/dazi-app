export interface PreparationOptions {
  mode: 'listen' | 'sequence';
  symbols: readonly string[];
  rounds: number;
  nextRoundMs: number;
  enabled: boolean;
}
export function validateAlphabet(symbols: readonly string[]) {
  if (
    !symbols.length ||
    new Set(symbols).size !== symbols.length ||
    symbols.some((s) => !/^[A-Z]$/.test(s))
  )
    throw new Error('Expected unique uppercase letters A–Z');
}
export function validatePreparation(options: PreparationOptions) {
  validateAlphabet(options.symbols);
  if (
    !Number.isInteger(options.rounds) ||
    options.rounds < 1 ||
    !Number.isFinite(options.nextRoundMs) ||
    options.nextRoundMs < 0
  )
    throw new Error('Invalid preparation rounds or timing');
}
