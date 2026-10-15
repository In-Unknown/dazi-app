import { calculateMastery, changePartMastery, type MasteryRules } from './mastery';

export interface MasteryPolicy {
  type: 'mastery';
  keys: readonly string[];
  rules: Readonly<MasteryRules>;
  reward: number;
  penalty: number;
}
export interface MasterySession {
  snapshot(): ReturnType<typeof calculateMastery>;
  beginRound(): void;
  reward(keys: readonly string[]): void;
  penalize(key: string): void;
  revealHint(): void;
}

/** Private records persist across chapter visits, but never across page reloads. */
export function createScorebook() {
  const records = new Map<string, Record<string, number>>();
  const scores = (id: string) => {
    if (!records.has(id)) records.set(id, {});
    return records.get(id)!;
  };
  const snapshot = (id: string, policy: MasteryPolicy) =>
    calculateMastery(policy.keys, { ...scores(id) }, policy.rules);
  return {
    snapshot,
    open(id: string, policy: MasteryPolicy): MasterySession {
      let eligible = true;
      return {
        snapshot: () => snapshot(id, policy),
        beginRound() {
          eligible = true;
        },
        reward(keys) {
          if (eligible)
            keys.forEach((key) => changePartMastery(scores(id), key, policy.reward, policy.rules));
        },
        penalize(key) {
          changePartMastery(scores(id), key, -policy.penalty, policy.rules);
        },
        revealHint() {
          const chapterScores = scores(id);
          // Hints remove earned credit from the whole chapter without forgiving debts.
          for (const key of Object.keys(chapterScores)) {
            chapterScores[key] = Math.min(chapterScores[key], 0);
          }
          eligible = false;
        },
      };
    },
  };
}
