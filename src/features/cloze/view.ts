import type { ExerciseContext } from '../../exercises/contracts';
import type { ClozeModel } from './model';
import type { ClozeOptions } from './chapter';
import { shuffle } from '../../core/random';
import { eyeIcon } from '../../ui/icons';

export function renderCloze(
  state: ClozeModel,
  context: ExerciseContext,
  options: ClozeOptions,
  renderClozeInput: () => void,
) {
  const { promptEl, hintEl, targetEl } = context.ui;
  const { symbols, gapLength, contextLength } = options;
  state.locked = false;
  promptEl.textContent = `补全空缺的 ${gapLength} 个连续字母`;
  promptEl.style.visibility = 'visible';
  hintEl.style.visibility = 'hidden';
  targetEl.classList.remove('scroll-mode', 'bm-mode');

  // 从 ABC 到 XYZ 的全部三元组合，与熟练度统计共用同一份键列表。
  const mastery = context.mastery!.snapshot();
  const triList = mastery.keys;

  // 所有组合均保留在洗牌题袋中，已达标组合也可以积累超额分数。
  if (!state.queue.length) {
    state.queue = shuffle([...triList]);
    if (state.queue.length > 1 && state.queue[0] === state.lastTarget)
      state.queue.push(state.queue.shift()!);
  }
  const currentTri = state.queue.shift()!;
  state.lastTarget = currentTri;
  const triStartIdx = symbols.indexOf(currentTri[0]);

  // 构造题目：展示上下文，挖空中间 3 个字母
  // 例如：前放 2 个已知字母，后放 2 个已知字母
  const preContext = symbols.slice(Math.max(0, triStartIdx - contextLength), triStartIdx);
  const postContext = symbols.slice(
    triStartIdx + gapLength,
    Math.min(symbols.length, triStartIdx + gapLength + contextLength),
  );

  targetEl.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'cloze-board';

  const slotsRow = document.createElement('div');
  slotsRow.className = 'cloze-slots';
  slotsRow.setAttribute('role', 'group');
  slotsRow.setAttribute('aria-label', `按顺序输入${gapLength === 3 ? '三' : gapLength}个缺失字母`);

  // 前置已知
  preContext.forEach((c) => {
    slotsRow.innerHTML += `<span class="cloze-char">${c}</span>`;
  });

  // 3 个空位
  for (let i = 0; i < gapLength; i++) {
    slotsRow.innerHTML += `<span class="cloze-gap" id="gap_${i}"></span>`;
  }

  // 后置已知
  postContext.forEach((c) => {
    slotsRow.innerHTML += `<span class="cloze-char">${c}</span>`;
  });

  container.appendChild(slotsRow);
  const status = document.createElement('div');
  status.id = 'clozeStatus';
  status.className = 'cloze-status';
  status.setAttribute('role', 'status');
  status.textContent = '填完后自动检查 · 可按 Backspace 修改';
  container.appendChild(status);

  // 提示放在输入区下方，直接在未填空位显示淡色答案。
  const help = document.createElement('div');
  help.className = 'cloze-help';
  const peekBtn = document.createElement('button');
  peekBtn.type = 'button';
  peekBtn.className = 'peek-btn';
  peekBtn.setAttribute('aria-pressed', 'false');
  peekBtn.setAttribute('aria-describedby', 'clozeHelpNote');
  peekBtn.innerHTML = eyeIcon + '<span>显示提示</span>';
  const note = document.createElement('span');
  note.id = 'clozeHelpNote';
  note.className = 'cloze-help-note';
  note.textContent = '查看将清空本章正分，保留负分';
  peekBtn.onclick = () => {
    if (state.locked) return;
    state.showHints = !state.showHints;
    if (state.showHints) {
      context.mastery!.revealHint();
      state.queue = [];
      context.refresh();
      note.textContent = '本章正分已清空，负分保留';
    }
    peekBtn.setAttribute('aria-pressed', String(state.showHints));
    peekBtn.querySelector('span')!.textContent = state.showHints ? '隐藏提示' : '显示提示';
    renderClozeInput();
  };
  help.append(peekBtn, note);
  container.appendChild(help);
  targetEl.appendChild(container);

  // 设置打字监听：直接在键盘敲出这 3 个字母
  state.target = currentTri;
  state.input = [];
  state.showHints = false;
  renderClozeInput();
  return;
}
