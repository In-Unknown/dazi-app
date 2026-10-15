import type { ExerciseContext, ExerciseSession } from '../../exercises/contracts';
import type { ClozeOptions } from './chapter';
import type { PreparationOptions } from '../preparation/options';
import { createPreparation } from '../preparation/session';
import { createClozeModel } from './model';
import { createClozeAnswer } from './answer';
import { createClozeInput } from './input';
import { renderCloze } from './view';
export function createClozeSession(
  context: ExerciseContext,
  options: ClozeOptions,
  preparation: PreparationOptions,
): ExerciseSession {
  const state = createClozeModel();
  const intro = createPreparation(context, preparation);
  const answer = createClozeAnswer(state, context, options);
  const keyDown = createClozeInput(state, context, answer);
  return {
    isPreparing: intro.isPreparing,
    startRound() {
      if (intro.isPreparing()) intro.startRound();
      else renderCloze(state, context, options, answer.renderClozeInput);
    },
    keyDown(event) {
      if (intro.isPreparing()) intro.keyDown(event);
      else keyDown(event);
    },
    dispose() {
      state.locked = true;
    },
  };
}
