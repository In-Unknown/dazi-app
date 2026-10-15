import type { InputSnapshot } from '../input/mode';
import type { UIElements } from './elements';
export function renderInputIndicators(ui: UIElements, state: InputSnapshot) {
  const upper = state.caps !== state.shift;
  ui.capsModeEl.textContent = upper ? '大写' : '小写';
  ui.capsModeEl.classList.toggle('on', upper);
  ui.imeModeEl.textContent = state.ime.toUpperCase();
  ui.imeModeEl.classList.toggle('zh', state.ime === 'zh');
}
