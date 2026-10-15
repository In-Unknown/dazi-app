import { $ } from './dom';
import type { UIElements } from './elements';
import type { CourseViewModel, CourseActions } from './course-model';
import { SPEED_TIERS } from '../data/rules';
export function updateDebugPanel(ui: UIElements, state: CourseViewModel, actions: CourseActions) {
  const { dbgTiers, dbgList } = ui;
  const CH = state.chapters;
  dbgTiers.innerHTML = '';
  SPEED_TIERS.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className = 'dbg-tier-btn' + (i === state.tier ? ' cur' : '');
    btn.textContent = `${i + 1}`;
    btn.title = `时间倍率 ×${m}`;
    btn.onclick = () => {
      actions.setTier(i);
    };
    dbgTiers.appendChild(btn);
  });

  dbgList.innerHTML = '';
  CH.forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.className = 'dbg-item' + (i === state.chapterIndex ? ' cur' : '');
    const num = String(i + 1).padStart(2, '0');
    btn.innerHTML = `<span class="dbg-num">${num}</span>${ch.title}`;
    btn.onclick = () => actions.startChapter(i);
    dbgList.appendChild(btn);
  });
}

export function installDebugPanel(ui: UIElements, signal: AbortSignal) {
  const { debugToggle, debugPanel } = ui;
  debugToggle.addEventListener(
    'click',
    () => {
      debugPanel.classList.toggle('hide');
    },
    { signal },
  );
  $('#dbgClose').addEventListener(
    'click',
    () => {
      debugPanel.classList.add('hide');
    },
    { signal },
  );
}
