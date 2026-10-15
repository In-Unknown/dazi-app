import { MASTERY_RULES } from '../data/rules';
import type { MasteryRules } from './mastery';
import type { MasteryPolicy } from './scorebook';
export interface MasteryConfig extends Partial<MasteryRules> {
  reward?: number;
  penalty?: number;
}
export function masteryPolicy(keys: readonly string[], config: MasteryConfig = {}): MasteryPolicy {
  const { reward = 1, penalty = 1, ...rules } = config;
  return {
    type: 'mastery',
    keys: [...keys],
    rules: { ...MASTERY_RULES, ...rules },
    reward,
    penalty,
  };
}
