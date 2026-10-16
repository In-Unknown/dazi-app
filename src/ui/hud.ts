import type { UIElements } from './elements';
import type { CourseViewModel } from './course-model';
import { masteryPercent } from '../domain/mastery';
import { SPEED_TIERS } from '../data/rules';

export function updateHUD(ui: UIElements, state: CourseViewModel) {
  const CH = state.chapters;
  const { roundEl, tierEl, errEl } = ui;
  const policy = CH[state.chapterIndex].progress;
  const total = policy.type === 'rounds' ? policy.count : 15;
  const mastery = state.mastery(state.chapterIndex);
  if (mastery) {
    const effective = mastery.effective.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
    roundEl.innerHTML = `<span class="lesson-stat" title="折算熟练度 / 达标基准；超额部分按${mastery.rules.alpha}计入，可超过基准">熟练度 <b id="masteryValue">${effective} / ${mastery.total}</b></span><span class="lesson-stat" title="达标覆盖率乘以薄弱程度折扣；已达标 ${mastery.reached} / ${mastery.keys.length}">博学度 <b id="breadthValue">${masteryPercent(mastery.breadth)}</b></span><span class="lesson-stat ${mastery.progress < 0 ? 'negative' : ''}" title="未练习为0%；欠分向左，进展向右，100%通关">进度 <b id="lessonProgress">${masteryPercent(mastery.progress)}</b></span>`;
  } else {
    roundEl.textContent = `${Math.min(state.round + 1, total)} / ${total}`;
  }
  tierEl.textContent = `难度 ${state.tier + 1} / ${SPEED_TIERS.length}`;
  errEl.textContent = `错误 ${state.errors}`;
  errEl.classList.toggle('has', state.errors > 0);
}
