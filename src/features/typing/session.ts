import type { ExerciseContext } from '../../exercises/contracts';
import type { TypingModel } from './model';
import type { TypingOptions } from './chapter';
import type { TypingView } from './view';
import { formatTypingDebug } from './debug';
import { playErrorSound, playSuccessSound } from '../../audio/feedback';
export function createTypingActions(
  state: TypingModel,
  context: ExerciseContext,
  config: TypingOptions,
  view: TypingView,
) {
  const { barEl, targetEl, flashEl } = context.ui;

  function tick() {
    if (!state.running) return;
    const left = state.deadline - performance.now();
    if (left <= 0) {
      onMistake(true);
      return;
    }

    const pct = Math.max(0, left / state.limit);
    barEl.style.transform = `scaleX(${pct})`;
    barEl.style.background =
      pct > 0.5 ? 'var(--done)' : pct > 0.25 ? 'var(--warn)' : 'var(--danger)';

    state.raf = context.tasks.frame(tick);
  }

  function onMistake(isTimeout: boolean) {
    if (!state.running || state.locked) return;

    playErrorSound(); // 触发沉闷下坠失败音效！

    state.running = false;
    state.locked = true;
    context.tasks.cancelFrame(state.raf);
    context.recordError();

    barEl.style.transform = 'scaleX(0)';
    targetEl.classList.remove('shake');
    void targetEl.offsetWidth;
    targetEl.classList.add('shake');

    flashEl.textContent = isTimeout
      ? '⏱ 超时 · 本章从第 1 题重来'
      : '✗ 键位、修饰键或时机错误 · 从第 1 题重来';
    flashEl.classList.add('show');

    context.tasks.after(config.timing.retryMs, () => {
      flashEl.classList.remove('show');
      context.restartChapterRounds();
    });
  }

  function handleCorrect() {
    const completedItem = state.typing.items[state.typing.position];
    state.typing.position++;
    context.input.accept(completedItem);

    view.updateDOM();
    context.setDebugText(formatTypingDebug(state));

    if (state.typing.position >= state.typing.items.length) {
      onComplete();
    }
  }

  function onComplete() {
    playSuccessSound(); // 触发多邻国过关大三和弦清脆音效！

    state.running = false;
    state.locked = true;
    context.tasks.cancelFrame(state.raf);
    barEl.style.transform = 'scaleX(0)';
    targetEl.classList.add('ok');

    context.completeRound(config.timing.successMs, true);
  }

  return { tick, onMistake, handleCorrect };
}
export type TypingActions = ReturnType<typeof createTypingActions>;
