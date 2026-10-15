import type { ChapterDefinition } from '../chapters/schema';
import type { ExerciseContext, ExerciseSession } from '../exercises/contracts';
import type { UIElements } from '../ui/elements';
import type { CourseViewModel } from '../ui/course-model';
import { createTaskScope } from '../core/task-scope';
import { createScorebook } from '../domain/scorebook';
import { createInputController } from '../input/mode';
import { renderInputIndicators } from '../ui/input-indicators';
import { renderTimeline } from '../ui/progress';
import { updateHUD } from '../ui/hud';
import { updateDebugPanel } from '../ui/debug';
import { stopLetterAudio } from '../audio/pronunciation';
import { SPEED_TIERS } from '../data/rules';

/** Course navigation only. Features own their rounds, preparation, answers and feedback. */
export function createApplication(chapters: readonly ChapterDefinition[], ui: UIElements) {
  if (!chapters.length) throw new Error('Enable at least one chapter');
  const course = { chapterIndex: 0, tier: 0, round: 0, errors: 0 };
  const scorebook = createScorebook();
  const input = createInputController((state) => renderInputIndicators(ui, state));
  let session: ExerciseSession | undefined;
  let tasks = createTaskScope();
  let disposed = false;
  let mastery: ExerciseContext['mastery'] = null;

  function snapshot(): CourseViewModel {
    return {
      ...course,
      chapters,
      mastery(index) {
        const chapter = chapters[index];
        return chapter.progress.type === 'mastery'
          ? scorebook.snapshot(chapter.id, chapter.progress)
          : null;
      },
    };
  }
  function refresh() {
    updateHUD(ui, snapshot());
    renderTimeline(ui, snapshot());
  }
  function debug() {
    updateDebugPanel(ui, snapshot(), { startChapter, setTier });
  }
  function advanceChapter() {
    if (course.chapterIndex + 1 >= chapters.length)
      course.tier = Math.min(course.tier + 1, SPEED_TIERS.length - 1);
    startChapter((course.chapterIndex + 1) % chapters.length);
  }
  function startRound(checkCompletion = true) {
    if (disposed || !session) return;
    tasks.cancel();
    stopLetterAudio();
    const chapter = chapters[course.chapterIndex];
    const policy = chapter.progress;
    if (
      checkCompletion &&
      !session.isPreparing?.() &&
      (policy.type === 'rounds'
        ? course.round >= policy.count
        : mastery!.snapshot().completion === 1)
    ) {
      advanceChapter();
      return;
    }
    document.querySelector('main')!.scrollTop = 0;
    ui.chDescEl.textContent = chapter.desc;
    input.reset(chapter.defaultCaps);
    mastery?.beginRound();
    ui.targetEl.classList.remove('ok', 'shake');
    ui.flashEl.classList.remove('show');
    const letters = chapter.layout === 'letters';
    document.body.classList.toggle('letter-lesson', letters);
    if (letters) {
      ui.targetEl.style.fontSize = '16px';
      ui.barEl.style.transform = 'scaleX(0)';
      refresh();
      ui.promptEl.style.visibility = 'visible';
      ui.hintEl.style.visibility = 'hidden';
      ui.targetEl.classList.remove('scroll-mode', 'bm-mode');
    }
    session.startRound();
  }
  function startChapter(index: number) {
    if (disposed) return;
    tasks.dispose();
    session?.dispose?.();
    tasks = createTaskScope();
    course.chapterIndex = ((index % chapters.length) + chapters.length) % chapters.length;
    course.round = 0;
    course.errors = 0;
    const chapter = chapters[course.chapterIndex];
    mastery =
      chapter.progress.type === 'mastery' ? scorebook.open(chapter.id, chapter.progress) : null;
    ui.chTitleEl.textContent = chapter.title;
    ui.chDescEl.textContent = chapter.desc;
    const scope = tasks;
    const active = () => !disposed && scope === tasks;
    const context: ExerciseContext = {
      ui,
      input,
      tasks: scope,
      mastery,
      tier: () => course.tier,
      round: () => course.round,
      refresh() {
        if (active()) refresh();
      },
      recordError() {
        if (active()) {
          course.errors++;
          refresh();
        }
      },
      restartRound() {
        if (active()) startRound();
      },
      restartChapterRounds() {
        if (active()) {
          course.round = 0;
          startRound();
        }
      },
      completeRound(feedbackMs, countImmediately = false) {
        if (!active()) return;
        if (countImmediately) course.round++;
        scope.after(feedbackMs, () => {
          if (!active()) return;
          if (!countImmediately) course.round++;
          startRound();
        });
      },
      setDescription(text) {
        if (active()) ui.chDescEl.textContent = text;
      },
      setDebugText(text) {
        if (active()) document.getElementById('rawBox')!.textContent = text;
      },
    };
    session = chapter.create(context);
    renderTimeline(ui, snapshot());
    debug();
    // Render each visit's entry state once. A course containing only completed,
    // preparation-free mastery chapters must still allow review without a skip loop.
    startRound(false);
  }
  function setTier(index: number) {
    if (disposed || !Number.isInteger(index) || index < 0 || index >= SPEED_TIERS.length) return;
    course.tier = index;
    refresh();
    debug();
    startRound();
  }
  ui.chTitleEl.textContent = chapters[0].title;
  ui.chDescEl.textContent = chapters[0].desc;
  ui.promptEl.style.visibility = 'hidden';
  ui.hintEl.style.visibility = 'hidden';
  refresh();
  renderInputIndicators(ui, input.snapshot());
  debug();
  return {
    startChapter,
    setTier,
    snapshot,
    keyDown(event: KeyboardEvent) {
      if (!disposed) session?.keyDown?.(event);
    },
    keyUp(event: KeyboardEvent) {
      if (!disposed) session?.keyUp?.(event);
    },
    dispose() {
      disposed = true;
      tasks.dispose();
      session?.dispose?.();
      stopLetterAudio();
    },
  };
}
