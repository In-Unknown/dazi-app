import type { ExerciseContext } from '../../exercises/contracts';
import type { TypingModel } from './model';
import type { TypingOptions } from './chapter';
import type { TypingView } from './view';
import type { TypingActions } from './session';
import { formatTypingDebug } from './debug';
import { compilePrompt } from './compiler';
import { sanitizeText } from '../../content/text';
import { expandSymbols } from './sequence';
import { SPEED_TIERS } from '../../data/rules';

export function renderTyping(
  state: TypingModel,
  context: ExerciseContext,
  ch: TypingOptions,
  view: TypingView,
  actions: TypingActions,
) {
  const { promptEl, hintEl, targetEl, barEl } = context.ui;
  const { fontSizeFor, buildDOM, updateDOM } = view;
  let item = state.roundList[context.round() % state.roundList.length];

  state.prompt = item.prompt || '';
  state.hint = item.hint || '';

  // 编译器由章节配置决定，与章节排列位置无关。
  if (ch.compiler === 'prompt' && state.prompt) {
    const compiled = compilePrompt(state.prompt, item.mode || ch.mode || 'full');
    promptEl.innerHTML = '';
    promptEl.appendChild(compiled.promptFrag);
    state.typing.items = compiled.items;
    state.typing.promptCharacters = compiled.charRefs;
    state.typing.promptWords = compiled.wordRefs;
    state.typing.mapsPrompt = true;
  } else {
    let text = sanitizeText(item.text);
    state.typing.items = expandSymbols(text);
    promptEl.innerHTML = '';
    promptEl.textContent = state.prompt;
    state.typing.mapsPrompt = false;
  }

  state.typing.position = 0;
  state.locked = false;

  const base = ch.timing.baseMs + state.typing.items.length * ch.timing.perStepMs;
  const mult = SPEED_TIERS[context.tier()];
  state.limit = Math.round(base * mult);
  state.deadline = performance.now() + state.limit;
  state.running = true;

  promptEl.style.visibility = state.prompt ? 'visible' : 'hidden';
  hintEl.textContent = state.hint;
  hintEl.style.visibility = state.hint ? 'visible' : 'hidden';

  targetEl.classList.remove('scroll-mode');
  targetEl.style.fontSize = fontSizeFor(state.typing.items.length);
  targetEl.classList.remove('ok', 'shake');

  barEl.style.transform = 'scaleX(1)';
  barEl.style.background = 'var(--done)';

  buildDOM();

  // 智能长文提词器滚动判定
  const isBlankMode = !!ch.isBlankLineMode;

  if (isBlankMode && state.typing.topRow && state.typing.bottomRow) {
    // 空行模式：分别测量上下两层，内容超标时各自开启滑动视口，短文本时自然展示
    if (state.typing.topRow.scrollHeight > 130) {
      state.typing.topRow.classList.add('scroll-box');
    }
    if (state.typing.bottomRow.scrollHeight > 140) {
      state.typing.bottomRow.classList.add('scroll-box');
    }
  } else {
    // 常规模式：维持单容器视口滚动
    const threshold = Math.min(280, window.innerHeight * 0.42);
    const needsScroll = state.typing.items.length > 25 || targetEl.scrollHeight > threshold;
    if (needsScroll) {
      targetEl.classList.add('scroll-mode');
    }
  }

  targetEl.scrollTop = 0;
  updateDOM();
  context.refresh();
  context.setDebugText(formatTypingDebug(state));

  context.tasks.cancelFrame(state.raf);
  state.raf = context.tasks.frame(actions.tick);
}
