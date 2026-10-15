export const SPEED_TIERS = [3, 2, 1, 2 / 3];

export const MASTERY_RULES = Object.freeze({ standard: 2, minimumMultiplier: 3, alpha: 0.25 });

export const ALPHABET_PRACTICE_ROUNDS = 3;

export const MASTERY_BASELINE =
  MASTERY_RULES.minimumMultiplier / (2 * (MASTERY_RULES.minimumMultiplier + 1));
