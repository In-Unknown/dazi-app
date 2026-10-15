import type { ExerciseContext, ExerciseSession } from '../../exercises/contracts';
import type { TypingOptions } from './chapter';
import { createTypingModel } from './model';
import { createTypingView } from './view';
import { createTypingActions } from './session';
import { createTypingInput } from './input';
import { renderTyping } from './view-round';

export function createTypingSession(
  context: ExerciseContext,
  config: TypingOptions,
): ExerciseSession {
  const rounds = config.buildList?.() ?? Array.from({ length: config.rounds }, () => config.gen!());
  if (!rounds.length) throw new Error(`Chapter ${config.id} generated no content`);
  const state = createTypingModel(rounds);
  const view = createTypingView(state, context.ui, config);
  const actions = createTypingActions(state, context, config, view);
  const input = createTypingInput(state, context, actions);
  return {
    startRound: () => renderTyping(state, context, config, view, actions),
    ...input,
    dispose() {
      state.running = false;
      state.locked = true;
    },
  };
}
