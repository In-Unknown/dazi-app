export type InputMethod = 'en' | 'zh';
export interface InputSnapshot {
  readonly ime: InputMethod;
  readonly caps: boolean;
  readonly shift: boolean;
}
export interface InputStep {
  type: string;
  isImeToggle?: boolean;
}

/** Simulated website input mode. Physical modifier and IME states are deliberately ignored. */
export function createInputController(onChange: (state: InputSnapshot) => void) {
  let state: InputSnapshot = { ime: 'en', caps: true, shift: false };
  return {
    snapshot: () => ({ ...state }),
    reset(defaultCaps = false) {
      state = { ime: 'en', caps: defaultCaps, shift: false };
      onChange(state);
    },
    letter(code: string) {
      if (!/^Key[A-Z]$/.test(code)) return null;
      const letter = code.slice(3);
      return state.caps !== state.shift ? letter : letter.toLowerCase();
    },
    accept(step: InputStep) {
      if (step.type === 'caps-down') state = { ...state, caps: !state.caps };
      else if (step.type === 'shift-down' && !step.isImeToggle) state = { ...state, shift: true };
      else if (step.type === 'shift-up')
        state = step.isImeToggle
          ? { ...state, ime: state.ime === 'en' ? 'zh' : 'en' }
          : { ...state, shift: false };
      onChange(state);
    },
  };
}
export type InputController = ReturnType<typeof createInputController>;
