import type { ExerciseContext } from '../../exercises/contracts';
import type { PreparationOptions } from './options';
import { speakerIcon } from '../../ui/icons';
import { playLetterAudio } from '../../audio/pronunciation';
import { codeToChar } from '../../input/keymap';
import { playSuccessSound, playKeySuccessSound, playErrorSound } from '../../audio/feedback';

/** Reusable introduction. Its caller chooses the mode, alphabet, rounds and whether to show it. */
export function createPreparation(context: ExerciseContext, options: PreparationOptions) {
  const { promptEl, targetEl } = context.ui;
  const symbols = options.symbols;
  const isListening = options.mode === 'listen';
  const range = `${symbols[0]}–${symbols.at(-1)}`;
  const roundLabel = options.rounds === 3 ? '三' : String(options.rounds);
  let active = options.enabled;
  const state = { heard: new Set<string>(), position: 0, completed: 0, locked: false };

  function renderLessonIntro() {
    context.setDescription(
      isListening
        ? `学习准备 · 逐个试听 ${range}，准备好后继续`
        : `学习准备 · 完整输入 ${range} ${roundLabel}轮，输错重来当前轮`,
    );
    promptEl.textContent = isListening ? '先认识字母的发音' : `先熟悉 ${range} 的顺序`;
    targetEl.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'intro-board';
    const description = document.createElement('p');
    description.className = 'intro-description';
    description.textContent = isListening
      ? '点击字母逐个试听，可以反复听。准备好后再开始配对。'
      : `从 ${symbols[0]} 到 ${symbols.at(-1)} 按顺序输入，自动练习 ${options.rounds} 轮。输错重来当前轮；完成${roundLabel}轮后可以手动加练。`;
    const grid = document.createElement('div');
    grid.className = 'alphabet-grid';
    grid.setAttribute('role', 'group');
    grid.setAttribute(
      'aria-label',
      isListening
        ? `${symbols[0]}到${symbols.at(-1)}字母发音表`
        : `${symbols[0]}到${symbols.at(-1)}顺序练习`,
    );
    symbols.forEach((letter, index) => {
      const tile = document.createElement(isListening ? 'button' : 'span');
      tile.className = 'alphabet-tile';
      tile.dataset.letter = letter;
      if (isListening) {
        tile.setAttribute('type', 'button');
        tile.setAttribute('aria-label', `试听字母 ${letter}`);
        tile.innerHTML = `<span>${letter}</span>${speakerIcon}`;
        tile.classList.toggle('heard', state.heard.has(letter));
        tile.onclick = () => {
          playLetterAudio(letter, tile);
          state.heard.add(letter);
          tile.classList.add('heard');
          targetEl.querySelector<HTMLElement>('#introStatus')!.textContent =
            `已试听 ${state.heard.size} / ${symbols.length} 个字母 · 可重复试听`;
        };
      } else {
        tile.textContent = letter;
        tile.classList.add(index < state.position ? 'done' : 'ghost');
      }
      grid.appendChild(tile);
    });
    const status = document.createElement('div');
    status.id = 'introStatus';
    status.className = 'intro-status';
    status.setAttribute('role', 'status');
    status.textContent = `已试听 ${state.heard.size} / ${symbols.length} 个字母 · 可重复试听`;
    const next = document.createElement('button');
    next.id = 'lessonContinue';
    next.type = 'button';
    next.className = 'lesson-continue';
    next.textContent = isListening ? '继续，开始配对' : '继续，开始填空';
    next.onclick = () => {
      if (!isListening && state.completed < options.rounds) return;
      active = false;
      context.restartRound();
    };
    const actions = document.createElement('div');
    actions.className = 'intro-actions';
    if (!isListening) {
      const retry = document.createElement('button');
      retry.id = 'lessonRetry';
      retry.type = 'button';
      retry.className = 'lesson-retry';
      retry.textContent = '重试一次';
      retry.hidden = true;
      retry.onclick = () => {
        if (state.completed < options.rounds || state.position !== symbols.length) return;
        state.position = 0;
        renderAlphabetPractice();
        targetEl.querySelector('.alphabet-tile.current')!.scrollIntoView({ block: 'nearest' });
      };
      actions.appendChild(retry);
    }
    actions.appendChild(next);
    board.append(description, grid, status, actions);
    targetEl.appendChild(board);
    if (!isListening) renderAlphabetPractice();
  }

  function renderAlphabetPractice(message = '') {
    const complete = state.position === symbols.length;
    const ready = state.completed >= options.rounds;
    targetEl.querySelectorAll('.alphabet-tile').forEach((tile, index) => {
      tile.classList.toggle('done', index < state.position);
      tile.classList.toggle('ghost', index >= state.position);
      tile.classList.toggle('current', index === state.position);
    });
    const status = targetEl.querySelector<HTMLElement>('#introStatus')!;
    status.className = 'intro-status' + (message ? ' error' : complete ? ' success' : '');
    const roundLabel = ready
      ? `已完成 ${state.completed} 轮`
      : `已完成 ${state.completed} / ${options.rounds} 轮`;
    status.textContent =
      `${roundLabel} · ` +
      (message ||
        (complete
          ? ready
            ? '可以开始填空，也可以再练一轮'
            : `本轮全部正确，即将自动开始第 ${state.completed + 1} 轮`
          : `本轮 ${state.position} / ${symbols.length} · 下一个字母 ${symbols[state.position]}`));
    targetEl.querySelector<HTMLButtonElement>('#lessonContinue')!.disabled = !ready;
    targetEl.querySelector<HTMLElement>('#lessonRetry')!.hidden = !(complete && ready);
  }

  function onPreparationKeyDown(e: KeyboardEvent) {
    const code = e.code || e.key;
    const isShift = code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Shift';
    const isCaps = code === 'CapsLock';

    if (isListening || state.locked) return;
    if (
      e.target instanceof Element &&
      e.target.closest('button') &&
      (code === 'Space' || code === 'Enter')
    )
      return;
    if (state.position === symbols.length || isShift || isCaps) return;
    const letter = context.input.letter(code);
    const key = codeToChar(code);
    if (!letter && (key === 'Enter' || (key === null && code !== 'Backspace'))) return;
    e.preventDefault();
    if (letter === symbols[state.position]) {
      state.position++;
      const complete = state.position === symbols.length;
      if (complete) {
        state.completed++;
        playSuccessSound();
      } else {
        playKeySuccessSound();
      }
      renderAlphabetPractice();
      (targetEl.querySelector('.alphabet-tile.current') ||
        targetEl.querySelector<HTMLElement>('#introStatus'))!.scrollIntoView({
        block: 'nearest',
      });
      if (complete && state.completed < options.rounds) {
        state.locked = true;
        context.tasks.after(options.nextRoundMs, () => {
          state.position = 0;
          state.locked = false;
          renderAlphabetPractice();
          targetEl.querySelector('.alphabet-tile.current')!.scrollIntoView({ block: 'nearest' });
        });
      }
    } else {
      state.position = 0;
      context.recordError();
      playErrorSound();
      renderAlphabetPractice(`输入不正确，已从 ${symbols[0]} 重新开始`);
      targetEl.querySelector('.alphabet-tile.current')!.scrollIntoView({ block: 'nearest' });
    }
    return;
  }

  return {
    isPreparing: () => active,
    startRound() {
      state.locked = false;
      renderLessonIntro();
    },
    keyDown: onPreparationKeyDown,
  };
}
