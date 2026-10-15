import type { ExerciseSession } from '../exercises/contracts';
export function installKeyboard(
  overlay: HTMLElement,
  session: Pick<ExerciseSession, 'keyDown' | 'keyUp'>,
  signal: AbortSignal,
) {
  document.addEventListener(
    'keydown',
    (e) => {
      if (!overlay.classList.contains('hide') || e.repeat || e.metaKey || e.ctrlKey || e.altKey)
        return;
      if (
        e.target instanceof Element &&
        e.target.closest('input, textarea, select, [contenteditable="true"]')
      )
        return;
      session.keyDown?.(e);
    },
    { signal },
  );
  document.addEventListener(
    'keyup',
    (e) => {
      if (overlay.classList.contains('hide')) session.keyUp?.(e);
    },
    { signal },
  );
}
