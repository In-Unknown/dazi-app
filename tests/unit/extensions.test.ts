import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApplication } from '../../src/app/controller';
import { createUI } from '../../src/ui/elements';
import { createInputController } from '../../src/input/mode';
import { createTaskScope } from '../../src/core/task-scope';
import { createScorebook } from '../../src/domain/scorebook';
import { masteryPolicy } from '../../src/domain/policy';
import type { ExerciseContext } from '../../src/exercises/contracts';
import { defineClozeChapter } from '../../src/features/cloze/chapter';
import { defineListeningChapter } from '../../src/features/listening/chapter';
import { defineTapChapter } from '../../examples/tap-exercise';
import { shortCloze, sxListening } from '../../examples/configured-chapters';

vi.mock('../../src/audio/feedback', () => ({
  playSuccessSound: vi.fn(),
  playKeySuccessSound: vi.fn(),
  playErrorSound: vi.fn(),
}));
vi.mock('../../src/audio/pronunciation', () => ({
  playLetterAudio: vi.fn(),
  stopLetterAudio: vi.fn(),
}));

const cleanups: (() => void)[] = [];
beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  document.body.innerHTML = '';
});
afterEach(() => {
  cleanups.splice(0).forEach((clean) => clean());
  vi.useRealTimers();
});
const key = (letter: string) =>
  new KeyboardEvent('keydown', { code: `Key${letter}`, key: letter.toLowerCase() });

function boot(chapters: Parameters<typeof createApplication>[0]) {
  const app = createApplication(chapters, createUI());
  cleanups.push(app.dispose);
  app.startChapter(0);
  return app;
}
function click(selector: string) {
  document.querySelector<HTMLButtonElement>(selector)!.click();
}

describe('extension contract', () => {
  it('runs a fourth exercise type with no central registration, and cancels completion on navigation', () => {
    const tap = defineTapChapter({
      id: 'tap-test',
      title: '点击',
      desc: '独立题型',
      tapsPerRound: 2,
      rounds: 2,
    });
    const app = boot([tap, sxListening]);
    for (let round = 0; round < 2; round++) {
      click('#target button');
      expect(app.snapshot().round).toBe(round);
      click('#target button');
      expect(document.querySelector<HTMLButtonElement>('#target button')!.disabled).toBe(true);
      vi.advanceTimersByTime(100);
    }
    expect(app.snapshot().chapterIndex).toBe(1);
    expect(document.querySelectorAll('.match-letter-select')).toHaveLength(2);
    app.startChapter(0);
    click('#target button');
    click('#target button');
    app.startChapter(1);
    const question = document.getElementById('target')!.innerHTML;
    vi.advanceTimersByTime(1000);
    expect(app.snapshot().round).toBe(0);
    expect(document.getElementById('target')!.innerHTML).toBe(question);
  });

  it('configures two-letter listening with distractors, preparation disabled and independent scoring', () => {
    const app = boot([sxListening, shortCloze]);
    expect(document.querySelectorAll('.alphabet-tile')).toHaveLength(0);
    expect(document.querySelectorAll('.match-audios .match-card')).toHaveLength(4);
    expect(
      [...document.querySelectorAll('.match-letter-select')].map((el) => el.textContent).sort(),
    ).toEqual(['S', 'X']);
    for (const letter of ['S', 'X']) {
      click(`.match-audios [data-letter="${letter}"]`);
      click(`.match-letters [data-letter="${letter}"] .match-letter-select`);
    }
    expect(app.snapshot().mastery(0)!.scores).toEqual({ S: 2, X: 2 });
    expect(app.snapshot().mastery(0)!.total).toBe(8);
    expect(app.snapshot().mastery(1)!.scores).toEqual({});
  });

  it('configures a shorter sequence, two preparation rounds and two gaps without editing the driver', () => {
    const app = boot([shortCloze]);
    expect(document.querySelectorAll('.alphabet-tile')).toHaveLength(4);
    for (let round = 0; round < 2; round++) {
      for (const letter of 'ABCD') app.keyDown(key(letter));
      vi.advanceTimersByTime(50);
    }
    expect(document.querySelector<HTMLButtonElement>('#lessonContinue')!.disabled).toBe(false);
    click('#lessonContinue');
    expect(document.querySelectorAll('.cloze-gap')).toHaveLength(2);
    expect(app.snapshot().mastery(0)!.keys).toEqual(['AB', 'BC', 'CD']);
    app.keyDown(key('Z'));
    expect(app.snapshot().errors).toBe(0); // no intermediate judgment
    app.keyDown(key('Z'));
    expect(app.snapshot().errors).toBe(1);
    expect(app.snapshot().mastery(0)!.rawSum).toBe(-1);
  });

  it('can repeat a completed mastery-only course with preparation disabled', () => {
    const chapter = defineClozeChapter({
      id: 'review-only',
      title: '复习',
      desc: '单章课程',
      preparation: false,
      questions: { symbols: ['A'], gapLength: 1 },
      mastery: { standard: 1 },
    });
    const app = boot([chapter]);
    app.keyDown(key('A'));
    vi.advanceTimersByTime(650);
    expect(app.snapshot().tier).toBe(1);
    expect(app.snapshot().mastery(0)!.completion).toBe(1);
    expect(document.querySelectorAll('.cloze-gap')).toHaveLength(1);
    expect(document.querySelector('.cloze-gap')!.textContent).toBe('\u00a0');
    app.keyDown(key('A'));
    vi.advanceTimersByTime(650);
    expect(app.snapshot().tier).toBe(2);
    expect(app.snapshot().mastery(0)!.scores).toEqual({ A: 2 });
  });

  it('rejects configurations that cannot produce usable questions', () => {
    const metadata = { id: 'invalid', title: '配置', desc: '校验' };
    expect(() => defineClozeChapter({ ...metadata, questions: { gapLength: 27 } })).toThrow();
    expect(() => defineClozeChapter({ ...metadata, preparation: { rounds: 0 } })).toThrow();
    expect(() => defineListeningChapter({ ...metadata, questions: { symbols: ['S'] } })).toThrow();
    expect(() => defineListeningChapter({ ...metadata, questions: { mix: [] } })).toThrow();
    expect(() => defineClozeChapter({ ...metadata, mastery: { standard: 0 } })).toThrow();
  });
});

describe('feature isolation', () => {
  function harness(): ExerciseContext {
    const ui = {
      targetEl: document.createElement('div'),
      promptEl: document.createElement('div'),
      hintEl: document.createElement('div'),
      barEl: document.createElement('div'),
      flashEl: document.createElement('div'),
    };
    document.body.append(...Object.values(ui));
    const tasks = createTaskScope();
    cleanups.push(tasks.dispose);
    const input = createInputController(() => {});
    input.reset(true);
    return {
      ui,
      input,
      tasks,
      mastery: createScorebook().open('isolated', masteryPolicy(['ABC'])),
      tier: () => 0,
      round: () => 0,
      refresh: vi.fn(),
      recordError: vi.fn(),
      restartRound: vi.fn(),
      restartChapterRounds: vi.fn(),
      completeRound: vi.fn(),
      setDescription: vi.fn(),
      setDebugText: vi.fn(),
    };
  }
  it('two instances of the same cloze feature do not share input, hints, locks or scores', () => {
    const chapter = defineClozeChapter({
      id: 'isolated',
      title: 'ABC',
      desc: '独立状态',
      preparation: false,
      questions: { symbols: ['A', 'B', 'C'] },
    });
    const a = harness(),
      b = harness();
    const first = chapter.create(a),
      second = chapter.create(b);
    first.startRound();
    second.startRound();
    first.keyDown!(key('A'));
    expect(a.ui.targetEl.querySelector('#gap_0')!.textContent).toBe('A');
    expect(b.ui.targetEl.querySelector('#gap_0')!.textContent).toBe('\u00a0');
    a.ui.targetEl.querySelector<HTMLButtonElement>('.peek-btn')!.click();
    first.keyDown!(key('B'));
    first.keyDown!(key('C'));
    for (const letter of 'ABC') second.keyDown!(key(letter));
    expect(a.mastery!.snapshot().scores).toEqual({});
    expect(b.mastery!.snapshot().scores).toEqual({ ABC: 1 });
    expect(a.completeRound).toHaveBeenCalledOnce();
    expect(b.completeRound).toHaveBeenCalledOnce();
    expect(b.ui.targetEl.querySelector('.peek-btn')!.getAttribute('aria-pressed')).toBe('false');
  });

  it('custom scoring policies, floors and hint eligibility remain local to their chapter', () => {
    const book = createScorebook();
    const a = book.open(
      'a',
      masteryPolicy(['A'], { standard: 4, minimumMultiplier: 2, penalty: 3, reward: 2 }),
    );
    const b = book.open('b', masteryPolicy(['B']));
    for (let i = 0; i < 5; i++) a.penalize('A');
    b.reward(['B']);
    expect(a.snapshot().scores).toEqual({ A: -8 });
    expect(a.snapshot().progress).toBe(-1);
    a.revealHint();
    a.reward(['A']);
    expect(a.snapshot().progress).toBe(-1);
    a.beginRound();
    a.reward(['A']);
    expect(a.snapshot().scores).toEqual({ A: -6 });
    expect(b.snapshot().scores).toEqual({ B: 1 });
    Object.assign(a.snapshot().scores, { A: 999 });
    expect(a.snapshot().scores.A).toBe(-6);
  });
});
