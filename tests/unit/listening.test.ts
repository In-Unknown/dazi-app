import { describe, expect, it } from 'vitest';
import { createMatchSequence, makeMatchQuestion } from '../../src/features/listening/questions';
import { LISTENING_DEFAULTS } from '../../src/features/listening/chapter';
import type { MatchType } from '../../src/features/listening/types';

describe('listening question invariants', () => {
  it('a one-target board keeps practicing weak letters when review letters exist', () => {
    const options = { ...LISTENING_DEFAULTS, symbols: ['S', 'X'], boardTargets: 1 };
    for (let i = 0; i < 20; i++) {
      const question = makeMatchQuestion(options, { S: 2, X: 0 }, 2, 0, 'board');
      expect(question.targets).toEqual(['X']);
    }
  });
  it('interleaves the requested mix in shuffled bags', () => {
    const nextMatchType = createMatchSequence(LISTENING_DEFAULTS.mix);
    const sequence = Array.from({ length: 50 }, () => nextMatchType());
    for (let i = 0; i < 50; i += 5) {
      expect(sequence.slice(i, i + 5).sort()).toEqual([
        'board',
        'contrast',
        'contrast',
        'single',
        'single',
      ]);
    }
  });
  it('every target has exactly one answer and every board retains distractors at every tier', () => {
    for (const tier of [0, 1, 2, 3]) {
      for (const type of ['board', 'single', 'contrast'] as MatchType[]) {
        for (let n = 0; n < 100; n++) {
          const q = makeMatchQuestion(LISTENING_DEFAULTS, {}, 2, tier, type);
          expect(new Set(q.targets).size).toBe(q.targets.length);
          expect(new Set(q.audios).size).toBe(q.audios.length);
          expect(q.targets.every((l) => q.audios.includes(l))).toBe(true);
          expect(q.audios.length).toBe(type === 'board' ? 7 : 4 + Math.min(tier, 2));
          expect(q.targets.length).toBe(type === 'board' ? 5 : type === 'single' ? 1 : 2);
        }
      }
    }
  });
});
