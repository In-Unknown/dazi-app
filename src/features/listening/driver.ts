import type { ExerciseContext, ExerciseSession } from '../../exercises/contracts';
import type { ListeningOptions } from './chapter';
import type { PreparationOptions } from '../preparation/options';
import { createPreparation } from '../preparation/session';
import { createMatchSequence, makeMatchQuestion } from './questions';
import { renderListening } from './view';
export function createListeningSession(
  context: ExerciseContext,
  options: ListeningOptions,
  preparation: PreparationOptions,
): ExerciseSession {
  const intro = createPreparation(context, preparation);
  const nextType = createMatchSequence(options.mix);
  return {
    isPreparing: intro.isPreparing,
    startRound() {
      if (intro.isPreparing()) {
        intro.startRound();
        return;
      }
      const { scores, rules } = context.mastery!.snapshot();
      renderListening(
        context,
        options,
        makeMatchQuestion(options, scores, rules.standard, context.tier(), nextType()),
      );
    },
    keyDown(event) {
      if (intro.isPreparing()) intro.keyDown(event);
    },
  };
}
