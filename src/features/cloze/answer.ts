import type { ExerciseContext } from '../../exercises/contracts';
import type { ClozeModel } from './model';
import type { ClozeOptions } from './chapter';
import { playSuccessSound, playErrorSound } from '../../audio/feedback';
export function createClozeAnswer(
  state: ClozeModel,
  context: ExerciseContext,
  options: ClozeOptions,
) {
  const { targetEl } = context.ui;

  function renderClozeInput() {
    for (let i = 0; i < state.target.length; i++) {
      const gap = targetEl.querySelector<HTMLElement>(`#gap_${i}`);
      if (!gap) continue;
      const value = state.input[i];
      const isGhost = !value && state.showHints;
      gap.textContent = value || (isGhost ? state.target[i] : '\u00a0');
      gap.classList.toggle('ghost', isGhost);
      gap.classList.toggle('active', !state.locked && i === state.input.length);
      gap.setAttribute(
        'aria-label',
        `第 ${i + 1} 个空：${value || (isGhost ? '提示 ' + state.target[i] : '未填写')}`,
      );
    }
  }

  function checkClozeAnswer() {
    if (state.locked || state.input.length !== state.target.length) return;
    state.locked = true;
    renderClozeInput();
    const correct = state.input.join('') === state.target;
    const status = targetEl.querySelector<HTMLElement>('#clozeStatus')!;
    targetEl.querySelector<HTMLButtonElement>('.peek-btn')!.disabled = true;
    state.input.forEach((value, i) => {
      targetEl
        .querySelector<HTMLElement>(`#gap_${i}`)!
        .classList.add(value === state.target[i] ? 'done' : 'wrong');
    });
    if (correct) {
      playSuccessSound();
      context.mastery!.reward([state.target]);
      context.refresh();
      status.className = 'cloze-status success';
      status.textContent = '全部正确';
      context.completeRound(options.successMs);
    } else {
      playErrorSound();
      context.mastery!.penalize(state.target);
      context.recordError();
      status.className = 'cloze-status error';
      status.textContent = '顺序不太对，再试一次';
      // 留出阅读反馈的时间，然后重试当前题，保留已经查看过提示的记录。
      context.tasks.after(options.retryMs, () => {
        state.input = [];
        state.locked = false;
        targetEl
          .querySelectorAll('.cloze-gap')
          .forEach((gap) => gap.classList.remove('done', 'wrong'));
        targetEl.querySelector<HTMLButtonElement>('.peek-btn')!.disabled = false;
        status.className = 'cloze-status';
        status.textContent = '填完后自动检查 · 可按 Backspace 修改';
        renderClozeInput();
      });
    }
  }

  return { renderClozeInput, checkClozeAnswer };
}
export type ClozeAnswer = ReturnType<typeof createClozeAnswer>;
