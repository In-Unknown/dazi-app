import type { ExerciseContext } from '../../exercises/contracts';
import type { TypingModel } from './model';
import type { TypingActions } from './session';
import { codeToChar, getRequiredIme } from '../../input/keymap';
export function createTypingInput(
  state: TypingModel,
  context: ExerciseContext,
  actions: TypingActions,
) {
  const { handleCorrect, onMistake } = actions;

  function onTypingKeyDown(e: KeyboardEvent) {
    const code = e.code || e.key;
    const isShift = code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Shift';
    const isCaps = code === 'CapsLock';

    if (!state.running || state.locked) return;

    const item = state.typing.items[state.typing.position];
    if (!item) return;

    if (item.type === 'shift-down') {
      if (isShift) {
        e.preventDefault();
        handleCorrect();
      } else {
        onMistake(false);
      }
      return;
    }

    if (item.type === 'caps-down') {
      if (isCaps) {
        e.preventDefault();
        handleCorrect();
      } else {
        onMistake(false);
      }
      return;
    }

    if (item.type === 'shift-up') {
      if (isShift) return; // 按住放行
      onMistake(false);
      return;
    }
    if (item.type === 'caps-up') {
      if (isCaps) return; // 按住放行
      onMistake(false);
      return;
    }

    if (isCaps) {
      onMistake(false);
      return;
    }

    if (isShift) {
      if (item.type === 'char' && item.shift === true) return;
      onMistake(false);
      return;
    }

    const k = codeToChar(code);
    if (k === null) {
      onMistake(false);
      return;
    }

    if (k === ' ' || k === 'Enter' || k === '/' || k === "'" || k === 'CapsLock') {
      e.preventDefault();
    }

    if (item.type === 'sp') {
      if (k === ' ') handleCorrect();
      else onMistake(false);
      return;
    }
    if (item.type === 'nl') {
      if (k === 'Enter') handleCorrect();
      else onMistake(false);
      return;
    }

    if (item.type === 'char') {
      const keyMatch = k.toLowerCase() === item.baseKey.toLowerCase();

      let shiftMatch = true;
      if (item.shift === true) shiftMatch = context.input.snapshot().shift;
      if (item.shift === false) shiftMatch = !context.input.snapshot().shift;
      const caseMatch =
        !/^[a-z]$/i.test(item.display) || context.input.letter(code) === item.display;
      const requiredIme = item.requiredIme || getRequiredIme(item.display);
      const imeMatch = !requiredIme || context.input.snapshot().ime === requiredIme;

      if (keyMatch && shiftMatch && caseMatch && imeMatch) {
        handleCorrect();
      } else {
        onMistake(false);
      }
    }
  }
  function onTypingKeyUp(e: KeyboardEvent) {
    if (!state.running || state.locked) return;
    const code = e.code || e.key;
    const item = state.typing.items[state.typing.position];
    if (!item) return;

    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Shift') {
      if (item.type === 'shift-up') {
        handleCorrect();
      } else {
        onMistake(false);
      }
      return;
    }

    if (code === 'CapsLock') {
      if (item.type === 'caps-up') {
        handleCorrect();
      } else {
        onMistake(false);
      }
      return;
    }
  }

  return { keyDown: onTypingKeyDown, keyUp: onTypingKeyUp };
}
