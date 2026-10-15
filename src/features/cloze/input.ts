import type { ExerciseContext } from '../../exercises/contracts';
import type { ClozeModel } from './model';
import type { ClozeAnswer } from './answer';
export function createClozeInput(state: ClozeModel, context: ExerciseContext, answer: ClozeAnswer) {
  const { renderClozeInput, checkClozeAnswer } = answer;

  function onClozeKeyDown(e: KeyboardEvent) {
    const code = e.code || e.key;

    if (code === 'Backspace') {
      e.preventDefault();
      if (!state.locked) {
        state.input.pop();
        renderClozeInput();
      }
      return;
    }
    const letter = context.input.letter(code);
    if (!letter) return;
    e.preventDefault();
    if (state.locked) return;
    state.input.push(letter);
    renderClozeInput();
    if (state.input.length === state.target.length) checkClozeAnswer();
    return;
  }

  return onClozeKeyDown;
}
