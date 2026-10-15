import { describe, expect, it } from 'vitest';
import { calculateMastery, changePartMastery, masteryPercent } from '../../src/domain/mastery';
import { createScorebook } from '../../src/domain/scorebook';
import { masteryPolicy } from '../../src/domain/policy';

describe('mastery contract', () => {
  const keys = ['A', 'B'];
  it('maps unpracticed to zero, all minimums to −100%, all standards to 100%', () => {
    const initial = calculateMastery(keys, {});
    expect(initial.completion).toBe(0.375);
    expect(initial.progress).toBe(0);
    expect(calculateMastery(keys, { A: -6, B: -6 }).progress).toBe(-1);
    expect(calculateMastery(keys, { A: 2, B: 2 }).completion).toBe(1);
  });
  it('repeated errors debit the same part to the floor and rewards have no ceiling', () => {
    const scores = { A: 0, B: 5 };
    for (let i = 0; i < 20; i++) changePartMastery(scores, 'A', -1);
    expect(scores).toEqual({ A: -6, B: 5 });
    for (let i = 0; i < 30; i++) changePartMastery(scores, 'A', 1);
    expect(scores.A).toBe(24);
  });
  it('counts surplus at α = .25 without letting surplus hide a weak part', () => {
    expect(calculateMastery(keys, { A: 10, B: 0 }).effective).toBe(4);
    expect(calculateMastery(keys, { A: 10000, B: 1 }).completion).toBeLessThan(1);
    expect(calculateMastery(keys, { A: 10000, B: 2 }).completion).toBe(1);
  });
  it('breadth penalizes concentrated deficits with the squared-deficit formula', () => {
    const balanced = calculateMastery(['A', 'B', 'C'], { A: 2, B: 0, C: 0 });
    const concentrated = calculateMastery(['A', 'B', 'C'], { A: 2, B: 1, C: -1 });
    expect(balanced.effective).toBe(concentrated.effective);
    expect(balanced.breadth).toBeGreaterThan(concentrated.breadth);
    expect(masteryPercent(0.999999)).toBe('99.99%');
  });
  it('hints clear every positive score, retain debts and zeroes, and preserve other chapters', () => {
    const book = createScorebook();
    const policy = masteryPolicy(['A', 'B', 'C', 'D', 'E']);
    const first = book.open('listening', policy);
    const second = book.open('cloze', masteryPolicy(['ABC']));
    for (let i = 0; i < 4; i++) first.reward(['A']);
    for (let i = 0; i < 2; i++) first.penalize('B');
    first.reward(['C']);
    first.penalize('C');
    for (let i = 0; i < 20; i++) first.penalize('D');
    for (let i = 0; i < 3; i++) second.reward(['ABC']);
    first.revealHint();
    first.reward(['A', 'B', 'E']);
    expect(first.snapshot().scores).toEqual({ A: 0, B: -2, C: 0, D: -6 });
    first.penalize('B');
    first.revealHint();
    expect(first.snapshot().scores).toEqual({ A: 0, B: -3, C: 0, D: -6 });
    expect(second.snapshot().scores).toEqual({ ABC: 3 });
    first.beginRound();
    first.reward(['A', 'B']);
    expect(book.open('listening', policy).snapshot().scores).toEqual({ A: 1, B: -2, C: 0, D: -6 });
  });
});
