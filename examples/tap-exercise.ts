import { defineChapter, type ChapterMetadata } from '../src/chapters/schema';
import type { ExerciseContext, ExerciseSession } from '../src/exercises/contracts';

interface TapConfig extends ChapterMetadata {
  tapsPerRound: number;
  rounds: number;
}

/** A fourth exercise type, intentionally excluded from the live course. */
export function defineTapChapter(config: TapConfig) {
  if (!Number.isInteger(config.tapsPerRound) || config.tapsPerRound < 1)
    throw new Error('Expected at least one tap');
  return defineChapter({
    ...config,
    kind: 'tap-example',
    layout: 'letters',
    progress: { type: 'rounds', count: config.rounds },
    create: (context) => createTapSession(context, config),
  });
}

function createTapSession(context: ExerciseContext, config: TapConfig): ExerciseSession {
  // Private to this visit. No central state, keyboard registry or navigation import.
  let taps = 0;
  return {
    startRound() {
      taps = 0;
      context.ui.promptEl.textContent = `点击 ${config.tapsPerRound} 次完成本轮`;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '开始';
      button.onclick = () => {
        if (button.disabled) return;
        button.textContent = `${++taps} / ${config.tapsPerRound}`;
        if (taps === config.tapsPerRound) {
          button.disabled = true;
          context.completeRound(100);
        }
      };
      context.ui.targetEl.replaceChildren(button);
      context.refresh();
    },
  };
}
