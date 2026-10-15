import type { ExerciseContext } from '../../exercises/contracts';
import type { TypingModel } from './model';
import type { TypingOptions } from './chapter';
import { makeArrowSvg } from '../../ui/icons';
export function createTypingView(
  state: TypingModel,
  ui: ExerciseContext['ui'],
  config: TypingOptions,
) {
  const { targetEl, promptEl } = ui;

  function fontSizeFor(len: number) {
    const isBlankMode = !!config.isBlankLineMode;
    if (isBlankMode) return 'clamp(1.5rem, 3.8vw, 2.5rem)';
    if (len <= 1) return 'clamp(5rem, 18vw, 10rem)';
    if (len <= 3) return 'clamp(3.5rem, 12vw, 7rem)';
    if (len <= 8) return 'clamp(2.5rem, 9vw, 5rem)';
    if (len <= 16) return 'clamp(1.8rem, 5.5vw, 3.2rem)';
    if (len <= 32) return 'clamp(1.4rem, 3.6vw, 2.2rem)';
    return 'clamp(1.2rem, 2.6vw, 1.7rem)';
  }

  function buildDOM() {
    const isBlankMode = !!config.isBlankLineMode;
    state.typing.elements = [];

    // 空行撰写章节：双行镜像结构
    if (isBlankMode) {
      targetEl.classList.add('bm-mode');
      const container = document.createElement('div');
      container.className = 'bm-container';

      // 1. 上方参考指引行（0.65em 紧凑展示）
      const topRow = document.createElement('div');
      topRow.className = 'bm-top-line';

      const divider = document.createElement('div');
      divider.className = 'bm-divider';

      // 2. 下方实写行（1.0em 全尺寸正文）
      const btmRow = document.createElement('div');
      btmRow.className = 'bm-btm-line';

      for (let i = 0; i < state.typing.items.length; i++) {
        const item = state.typing.items[i];

        const stack = document.createElement('div');
        stack.className = 'item-stack';

        let mainEl;
        if (item.type.includes('shift') || item.type.includes('caps')) {
          mainEl = document.createElement('span');
          mainEl.className = 'arrow-item ' + item.color;
          mainEl.appendChild(makeArrowSvg(item.type));
        } else {
          mainEl = document.createElement('span');
          mainEl.className = 'ch';
          if (item.type === 'nl') {
            mainEl.textContent = '↵';
            mainEl.classList.add('nl');
          } else if (item.type === 'sp') {
            mainEl.textContent = '\u00A0';
            mainEl.classList.add('sp');
          } else if (item.type === 'char') {
            mainEl.textContent = item.display;
            if (item.display >= 'a' && item.display <= 'z') mainEl.classList.add('lower');
          }
        }
        stack.appendChild(mainEl);

        let hintEl = null;
        if (item.hint) {
          hintEl = document.createElement('span');
          hintEl.className = 'item-hint';
          if (item.type === 'char') {
            hintEl.classList.add('key-box');
          } else {
            hintEl.classList.add('text-hint');
            if (item.color) hintEl.classList.add(item.color);
          }
          hintEl.textContent = item.hint;
          stack.appendChild(hintEl);
        }
        topRow.appendChild(stack);

        if (item.type === 'nl') {
          const br = document.createElement('div');
          br.className = 'break-flex';
          topRow.appendChild(br);
        }

        // 下方 Stack (修饰键不占位，只处理真实字符与回车断行)
        let btmEl = null;
        if (item.type === 'char' || item.type === 'sp') {
          const btmStack = document.createElement('div');
          btmStack.className = 'item-stack';

          btmEl = document.createElement('span');
          btmEl.className = 'ch bm-input-char';
          if (item.type === 'sp') {
            btmEl.textContent = '\u00A0';
            btmEl.classList.add('sp');
          } else {
            btmEl.textContent = item.display;
            if (item.display >= 'a' && item.display <= 'z') btmEl.classList.add('lower');
          }
          btmStack.appendChild(btmEl);
          btmRow.appendChild(btmStack);
        } else if (item.type === 'nl') {
          // 回车键在下方不显示 ↵ 符号，只留一个光标等待锚点，并断行
          btmEl = document.createElement('span');
          btmEl.className = 'bm-nl-anchor';
          btmRow.appendChild(btmEl);

          const br = document.createElement('div');
          br.className = 'break-flex';
          btmRow.appendChild(br);
        }

        state.typing.elements.push({ stack, main: mainEl, hint: hintEl, btm: btmEl });
      }

      container.appendChild(topRow);
      container.appendChild(divider);
      container.appendChild(btmRow);

      // 存储这两个独立的滑动窗口容器引用
      state.typing.topRow = topRow;
      state.typing.bottomRow = btmRow;

      targetEl.innerHTML = '';
      targetEl.appendChild(container);
      return;
    }

    // 常规章节逻辑
    targetEl.classList.remove('bm-mode');
    state.typing.topRow = null;
    state.typing.bottomRow = null;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < state.typing.items.length; i++) {
      const item = state.typing.items[i];
      const stack = document.createElement('div');
      stack.className = 'item-stack';

      let mainEl;
      if (item.type.includes('shift') || item.type.includes('caps')) {
        mainEl = document.createElement('span');
        mainEl.className = 'arrow-item ' + item.color;
        mainEl.appendChild(makeArrowSvg(item.type));
      } else {
        mainEl = document.createElement('span');
        mainEl.className = 'ch';
        if (item.type === 'nl') {
          mainEl.textContent = '↵';
          mainEl.classList.add('nl');
        } else if (item.type === 'sp') {
          mainEl.textContent = '\u00A0';
          mainEl.classList.add('sp');
        } else if (item.type === 'char') {
          mainEl.textContent = item.display;
          if (item.display >= 'a' && item.display <= 'z') mainEl.classList.add('lower');
        }
      }
      stack.appendChild(mainEl);

      let hintEl = null;
      if (item.hint) {
        hintEl = document.createElement('span');
        hintEl.className = 'item-hint';
        if (item.type === 'char') {
          hintEl.classList.add('key-box');
        } else {
          hintEl.classList.add('text-hint');
          if (item.color) hintEl.classList.add(item.color);
        }
        hintEl.textContent = item.hint;
        stack.appendChild(hintEl);
      }
      frag.appendChild(stack);

      if (item.type === 'nl') {
        const br = document.createElement('div');
        br.className = 'break-flex';
        frag.appendChild(br);
      }
      state.typing.elements.push({ stack, main: mainEl, hint: hintEl });
    }

    targetEl.innerHTML = '';
    targetEl.appendChild(frag);
  }

  function smoothScrollToActive(container: HTMLElement | null, el: HTMLElement | null | undefined) {
    if (!container || !el) return;
    const target = el.closest<HTMLElement>('.item-stack') || el;
    // 计算目标元素正好处于容器中心位置时的 scrollTop 值
    const targetY = target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
    container.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });
  }

  function updateDOM() {
    const isBlankMode = !!config.isBlankLineMode;
    let activeBtmIdx = -1;

    // 1. 更新打字目标区字符状态
    for (let i = 0; i < state.typing.items.length; i++) {
      const els = state.typing.elements[i];
      if (!els) continue;

      if (i < state.typing.position) {
        els.main.classList.add('done');
        els.main.classList.remove('cur');
        if (els.hint) els.hint.classList.add('done');
      } else if (i === state.typing.position) {
        els.main.classList.add('cur');
        els.main.classList.remove('done');
        if (els.hint) els.hint.classList.remove('done');
      } else {
        els.main.classList.remove('done', 'cur');
        if (els.hint) els.hint.classList.remove('done');
      }
    }

    // 2. 空行模式下更新下方字符显现和光标定位
    if (isBlankMode) {
      for (let i = state.typing.position; i < state.typing.items.length; i++) {
        if (state.typing.elements[i] && state.typing.elements[i].btm) {
          activeBtmIdx = i;
          break;
        }
      }

      for (let i = 0; i < state.typing.items.length; i++) {
        const els = state.typing.elements[i];
        if (!els || !els.btm) continue;

        if (i < state.typing.position) {
          els.btm.classList.add('typed');
          els.btm.classList.remove('cur');
        } else if (i === activeBtmIdx) {
          els.btm.classList.add('cur');
          els.btm.classList.remove('typed');
        } else {
          els.btm.classList.remove('typed', 'cur');
        }
      }
    }

    // 3. 更新 Prompt（中文参考栏）的联动高亮、整词框选与逐字变绿
    if (state.typing.mapsPrompt) {
      for (const el of state.typing.promptCharacters) {
        if (el) el.classList.remove('p-cur');
      }
      for (const key in state.typing.promptWords) {
        state.typing.promptWords[key].classList.remove('p-word-cur');
      }

      // 核心判定：空格确认/直接字符输入后立即变绿
      for (let i = 0; i < state.typing.position; i++) {
        const it = state.typing.items[i];
        if (!it) continue;
        if (it.promptCharIdx !== undefined) {
          if (
            it.promptAction === 'char-confirm' ||
            it.promptAction === 'direct-char' ||
            it.promptAction === 'abbrev-char'
          ) {
            if (state.typing.promptCharacters[it.promptCharIdx]) {
              state.typing.promptCharacters[it.promptCharIdx].classList.add('p-done');
            }
          }
        }
      }

      // 推进保护：光标推进到标点或下一个字符时，前方所有汉字全部确认变绿
      let activePromptElToScroll = null;
      if (state.typing.position < state.typing.items.length) {
        const curItem = state.typing.items[state.typing.position];
        if (curItem && curItem.promptCharIdx !== undefined) {
          for (let c = 0; c < curItem.promptCharIdx; c++) {
            if (state.typing.promptCharacters[c])
              state.typing.promptCharacters[c].classList.add('p-done');
          }
        }

        if (curItem && curItem.isOpeningIme) {
          if (state.typing.promptCharacters[0])
            state.typing.promptCharacters[0].classList.add('p-cur');
          if (state.typing.promptWords['w_0']) {
            state.typing.promptWords['w_0'].classList.add('p-word-cur');
            activePromptElToScroll = state.typing.promptWords['w_0'];
          } else {
            activePromptElToScroll = state.typing.promptCharacters[0];
          }
        } else if (curItem) {
          if (curItem.promptWordId && state.typing.promptWords[curItem.promptWordId]) {
            state.typing.promptWords[curItem.promptWordId].classList.add('p-word-cur');
            activePromptElToScroll = state.typing.promptWords[curItem.promptWordId];
          }
          if (
            curItem.promptCharIdx !== undefined &&
            state.typing.promptCharacters[curItem.promptCharIdx]
          ) {
            state.typing.promptCharacters[curItem.promptCharIdx].classList.add('p-cur');
            if (!activePromptElToScroll)
              activePromptElToScroll = state.typing.promptCharacters[curItem.promptCharIdx];
          }
        }
      } else {
        for (const el of state.typing.promptCharacters) {
          if (el) el.classList.add('p-done');
        }
      }

      // 提示词视口平滑滚动追踪
      if (activePromptElToScroll && promptEl.scrollHeight > promptEl.clientHeight) {
        activePromptElToScroll.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // 精准双窗口独立平滑居中滚动
    if (state.typing.position < state.typing.elements.length) {
      const isBlankMode = !!config.isBlankLineMode;

      if (isBlankMode) {
        // 1. 上滑动窗口：将当前拼音/按键参考行精确滚到中央明亮区
        if (state.typing.topRow && state.typing.topRow.classList.contains('scroll-box')) {
          const topEl = state.typing.elements[state.typing.position]?.stack;
          smoothScrollToActive(state.typing.topRow, topEl);
        }

        // 2. 下滑动窗口：将当前正在输入的字符/光标行精确滚到中央明亮区
        if (state.typing.bottomRow && state.typing.bottomRow.classList.contains('scroll-box')) {
          const btmEl =
            activeBtmIdx >= 0 && state.typing.elements[activeBtmIdx]
              ? state.typing.elements[activeBtmIdx].btm
              : state.typing.elements[state.typing.position]?.btm;
          smoothScrollToActive(state.typing.bottomRow, btmEl);
        }
      } else if (targetEl.classList.contains('scroll-mode')) {
        // 常规模式单窗口滚动
        const currentStack = state.typing.elements[state.typing.position]?.stack;
        if (currentStack) currentStack.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  return { fontSizeFor, buildDOM, updateDOM };
}
export type TypingView = ReturnType<typeof createTypingView>;
