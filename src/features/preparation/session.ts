import type { ExerciseContext } from '../../exercises/contracts';
import type { PreparationOptions } from './options';
import { speakerIcon } from '../../ui/icons';
import { playSymbolAudio, symbolAudioDurationMs } from '../../audio/symbol-audio';
import { codeToChar } from '../../input/keymap';
import { shuffle } from '../../core/random';
import { playSuccessSound, playKeySuccessSound, playErrorSound } from '../../audio/feedback';

/** 引导试听：每段之间的停顿，以及测量失败时的回退时长。 */
const CLIP_GAP_MS = 350;
const FALLBACK_CLIP_MS = 700;

/** 可复用的介绍页：调用方决定模式、符号、轮次、音频池与是否展示。 */
export function createPreparation(context: ExerciseContext, options: PreparationOptions) {
  const { promptEl, targetEl } = context.ui;
  const symbols = options.symbols;
  const label = options.label ?? '字母';
  const isListening = options.mode === 'listen';
  const range = `${symbols[0]}–${symbols.at(-1)}`;
  const roundLabel = options.rounds === 3 ? '三' : String(options.rounds);
  let active = options.enabled;
  const state = {
    heard: new Set<string>(),
    position: 0,
    completed: 0,
    locked: false,
    sequenceRunning: false,
    sequenceDone: false,
  };
  const tiles = new Map<string, HTMLElement>();
  let currentGrid: HTMLElement | null = null;

  const introStatus = () => targetEl.querySelector<HTMLElement>('#introStatus');
  const continueButton = () => targetEl.querySelector<HTMLButtonElement>('#lessonContinue');
  const setStatus = (text: string) => {
    const status = introStatus();
    if (status) status.textContent = text;
  };

  /**
   * 让整块符号板在可视高度内排布：先算高度最多能放几行，放不下就增加列数（加宽），
   * 而不是纵向滚动。同时按列数限制网格最大宽度，避免方块被拉得过宽。
   */
  function applyGridLayout(grid: HTMLElement) {
    const count = symbols.length;
    const mobile = window.innerWidth <= 600;
    const gap = mobile ? 8 : 10;
    const tileH = mobile ? 54 : 64;
    const tileTargetW = mobile ? 64 : 96;
    // 预留顶部 header、状态行、按钮与间距，避免它们把网格挤出视口。
    const reserved = mobile ? 200 : 250;
    const available = Math.max(tileH, window.innerHeight - reserved);
    const maxRows = Math.max(1, Math.floor((available + gap) / (tileH + gap)));
    const minCols = Math.min(7, count);
    // 宽度上限：保证每列不小于约 54px，避免过窄。
    const boardW = Math.min(1080, window.innerWidth * 0.94);
    const maxColsByWidth = Math.max(1, Math.floor((boardW + gap) / (54 + gap)));
    const cols = Math.min(Math.max(minCols, Math.ceil(count / maxRows)), maxColsByWidth);
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    grid.style.maxWidth = `${cols * (tileTargetW + gap) - gap}px`;
  }

  const relayout = () => {
    if (currentGrid) applyGridLayout(currentGrid);
  };
  window.addEventListener('resize', relayout);

  /** 引导播放期间禁用全部音频方块，使其变灰且不可触发。 */
  function setTilesDisabled(disabled: boolean) {
    if (!isListening) return;
    tiles.forEach((tile) => {
      if (tile instanceof HTMLButtonElement) tile.disabled = disabled;
    });
  }

  /** 播放单个符号并点亮其方格。 */
  function playSymbol(symbol: string) {
    if (options.audio) playSymbolAudio(options.audio, symbol, tiles.get(symbol));
    state.heard.add(symbol);
    tiles.get(symbol)?.classList.add('heard');
  }

  function clipDurationMs(symbol: string) {
    const measured = options.audio ? symbolAudioDurationMs(options.audio, symbol) : null;
    return (measured == null ? FALLBACK_CLIP_MS : measured) + CLIP_GAP_MS;
  }

  /** 正序 + 倒序 + 两遍打乱：顺序变化但不重复、不遗漏任何符号。 */
  function buildGuidedOrder(): string[] {
    return [
      ...symbols,
      ...[...symbols].reverse(),
      ...shuffle([...symbols]),
      ...shuffle([...symbols]),
    ];
  }

  function runGuidedStep(order: string[], index: number) {
    if (!active || !state.sequenceRunning) return;
    if (index >= order.length) {
      state.sequenceRunning = false;
      state.sequenceDone = true;
      const next = continueButton();
      if (next) next.disabled = false;
      setTilesDisabled(false);
      setStatus('');
      return;
    }
    const symbol = order[index];
    playSymbol(symbol);
    setStatus(`${index + 1} / ${order.length}`);
    context.tasks.after(clipDurationMs(symbol), () => runGuidedStep(order, index + 1));
  }

  function startGuidedSequence() {
    if (!isListening || state.sequenceRunning) return;
    state.sequenceRunning = true;
    const next = continueButton();
    if (next) next.disabled = true;
    setTilesDisabled(true);
    runGuidedStep(buildGuidedOrder(), 0);
  }

  function renderLessonIntro() {
    context.setDescription(
      isListening ? `学习准备 · 逐个试听 ${range}` : `学习准备 · 完整输入 ${range} ${roundLabel}轮`,
    );
    promptEl.textContent = isListening
      ? `先认识${label}的发音${options.promptNote ? ' ' + options.promptNote : ''}`
      : `先熟悉 ${range} 的顺序`;
    targetEl.innerHTML = '';
    tiles.clear();
    const board = document.createElement('div');
    board.className = 'intro-board';
    const grid = document.createElement('div');
    grid.className = 'alphabet-grid';
    grid.setAttribute('role', 'group');
    grid.setAttribute(
      'aria-label',
      isListening
        ? `${symbols[0]}到${symbols.at(-1)}${label}发音表`
        : `${symbols[0]}到${symbols.at(-1)}顺序练习`,
    );
    symbols.forEach((letter, index) => {
      const tile = document.createElement(isListening ? 'button' : 'span');
      tile.className = 'alphabet-tile';
      tile.dataset.letter = letter;
      if (isListening) {
        tile.setAttribute('type', 'button');
        tile.setAttribute('aria-label', `试听${label} ${letter}`);
        tile.innerHTML = `<span>${letter}</span>${speakerIcon}`;
        tile.classList.toggle('heard', state.heard.has(letter));
        tile.onclick = () => {
          // 引导试听进行中不接受手动点击，避免打断连续播放；也不改动提示文案。
          if (state.sequenceRunning) return;
          playSymbol(letter);
        };
      } else {
        tile.textContent = letter;
        tile.classList.add(index < state.position ? 'done' : 'ghost');
      }
      tiles.set(letter, tile);
      grid.appendChild(tile);
    });
    currentGrid = grid;
    applyGridLayout(grid);
    // 重入且引导仍在进行时，新渲染的方块立即回到禁用态。
    if (state.sequenceRunning) setTilesDisabled(true);
    const status = document.createElement('div');
    status.id = 'introStatus';
    status.className = 'intro-status';
    status.setAttribute('role', 'status');
    status.textContent = isListening ? '按空格开始' : '';
    const next = document.createElement('button');
    next.id = 'lessonContinue';
    next.type = 'button';
    next.className = 'lesson-continue';
    next.textContent = isListening ? '继续，开始配对' : '继续，开始填空';
    // listen 模式需先听完引导试听才可继续；sequence 模式由 renderAlphabetPractice 控制。
    next.disabled = isListening;
    next.onclick = () => {
      if (isListening) {
        if (!state.sequenceDone) return;
      } else if (state.completed < options.rounds) return;
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
    board.append(grid, status, actions);
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
          : `本轮 ${state.position} / ${symbols.length}`));
    targetEl.querySelector<HTMLButtonElement>('#lessonContinue')!.disabled = !ready;
    targetEl.querySelector<HTMLElement>('#lessonRetry')!.hidden = !(complete && ready);
  }

  function onPreparationKeyDown(e: KeyboardEvent) {
    const code = e.code || e.key;
    const isShift = code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Shift';
    const isCaps = code === 'CapsLock';

    // listen 模式：空格启动引导试听；焦点在“继续”按钮上时交回原生行为。
    if (isListening) {
      if (code !== 'Space') return;
      if (e.target instanceof Element && e.target.closest('#lessonContinue')) return;
      e.preventDefault();
      startGuidedSequence();
      return;
    }
    if (state.locked) return;
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
    dispose() {
      window.removeEventListener('resize', relayout);
    },
  };
}
