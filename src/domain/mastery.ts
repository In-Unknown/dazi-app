import { MASTERY_RULES } from '../data/rules';

export interface MasteryRules {
  standard: number;
  minimumMultiplier: number;
  alpha: number;
}
export function calculateMastery(
  keys: readonly string[],
  scores: Readonly<Record<string, number>>,
  rules: MasteryRules = MASTERY_RULES,
) {
  const { standard, minimumMultiplier, alpha } = rules;
  const baseline = minimumMultiplier / (2 * (minimumMultiplier + 1));
  const total = keys.length * standard;
  const minimum = -minimumMultiplier * total;
  let effective = 0,
    rawSum = 0,
    reached = 0,
    squaredDeficit = 0;
  keys.forEach((key) => {
    const value = Math.max(-minimumMultiplier * standard, scores[key] || 0);
    rawSum += value;
    effective += Math.min(standard, value) + alpha * Math.max(0, value - standard);
    if (value >= standard) reached++;
    const deficit = Math.max(0, standard - value) / ((minimumMultiplier + 1) * standard);
    squaredDeficit += deficit * deficit;
  });
  const proficiency = Math.min(1, Math.max(0, (effective - minimum) / (total - minimum)));
  const coverage = reached / keys.length;
  const breadth = coverage * (1 - Math.sqrt(squaredDeficit / keys.length));
  const completion = (proficiency + breadth) / 2;
  // 零点两边分别映射到[-100%,0%]和[0%,100%]，不改变原始满分判定。
  const progress =
    completion >= baseline
      ? (completion - baseline) / (1 - baseline)
      : (completion - baseline) / baseline;
  return {
    keys,
    rules,
    baseline,
    scores,
    total,
    minimum,
    effective,
    rawSum,
    reached,
    proficiency,
    coverage,
    breadth,
    completion,
    progress,
  };
}

export function changePartMastery(
  scores: Record<string, number>,
  key: string,
  delta: number,
  rules: MasteryRules = MASTERY_RULES,
) {
  scores[key] = Math.max(-rules.minimumMultiplier * rules.standard, (scores[key] || 0) + delta);
}

export function masteryPercent(value: number) {
  // 未满分时显示值不向上舍入成100%，通关始终使用原始completion。
  const magnitude = Math.min(100, Math.floor(Math.abs(value) * 10000) / 100);
  return `${value < 0 && magnitude > 0 ? '−' : ''}${magnitude.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}%`;
}

export type MasterySnapshot = ReturnType<typeof calculateMastery>;
