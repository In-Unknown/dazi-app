import type { UIElements } from './elements';
import type { CourseViewModel } from './course-model';
import { masteryPercent } from '../domain/mastery';
import { MASTERY_BASELINE } from '../data/rules';

export function renderTimeline(ui: UIElements, state: CourseViewModel) {
  const CH = state.chapters;
  const { timelineEl } = ui;
  timelineEl.setAttribute('role', 'group');
  timelineEl.setAttribute('aria-label', '章节进度');
  if (timelineEl.children.length !== CH.length) {
    timelineEl.innerHTML = '';
    for (let i = 0; i < CH.length; i++) {
      const el = document.createElement('div');
      el.className = 'tl-ch';
      el.innerHTML =
        '<span class="tl-base"></span><span class="tl-gain"></span><span class="tl-debt"></span><span class="tl-zero"></span>';
      timelineEl.appendChild(el);
    }
  }
  const cur = state.chapterIndex;
  for (let i = 0; i < CH.length; i++) {
    const el = timelineEl.children[i] as HTMLElement;
    const mastery = state.mastery(i);
    const policy = CH[i].progress;
    const total = mastery ? 100 : policy.type === 'rounds' ? policy.count : 15;
    const current =
      i < cur
        ? total
        : i === cur
          ? mastery
            ? mastery.progress * 100
            : Math.min(state.round, total)
          : 0;
    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-label', `第 ${i + 1} 章：${CH[i].title}`);
    el.setAttribute('aria-valuemin', mastery ? '-100' : '0');
    el.setAttribute('aria-valuemax', String(total));
    el.setAttribute('aria-valuenow', String(current));
    el.setAttribute(
      'aria-valuetext',
      mastery ? masteryPercent(current / 100) : `${current} / ${total}`,
    );
    el.title = `${CH[i].title} · 进度 ${mastery ? masteryPercent(current / 100) + '（左侧为欠分区，竖线为零点）' : current + ' / ' + total}`;
    el.classList.toggle('signed', !!mastery);
    el.classList.toggle('negative', !!mastery && i === cur && mastery.progress < 0);
    el.classList.toggle('full', !!mastery && i === cur && mastery.completion === 1);
    el.style.setProperty('--zero', `${(mastery?.baseline ?? MASTERY_BASELINE) * 100}%`);
    el.style.setProperty(
      '--gain',
      String(mastery && i === cur ? Math.max(0, mastery.progress) : 0),
    );
    el.style.setProperty(
      '--debt-fill',
      String(mastery && i === cur ? Math.max(0, -mastery.progress) : 0),
    );
    el.classList.remove('done', 'active');
    if (i < cur) {
      el.classList.add('done');
      el.style.removeProperty('--p');
    } else if (i === cur) {
      el.classList.add('active');
      el.style.setProperty('--p', String(current / total));
    } else {
      el.style.removeProperty('--p');
    }
  }
}
