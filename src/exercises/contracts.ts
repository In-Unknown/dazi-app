import type { TaskScope } from '../core/task-scope';
import type { MasterySession } from '../domain/scorebook';
import type { InputController } from '../input/mode';
import type { UIElements } from '../ui/elements';

/** The only bridge from a feature to the course. No mutable course state is exposed. */
export interface ExerciseContext {
  readonly ui: Pick<UIElements, 'targetEl' | 'promptEl' | 'hintEl' | 'barEl' | 'flashEl'>;
  readonly input: InputController;
  readonly tasks: TaskScope;
  readonly mastery: MasterySession | null;
  tier(): number;
  round(): number;
  refresh(): void;
  recordError(): void;
  restartRound(): void;
  restartChapterRounds(): void;
  /** Typing counts immediately; letter exercises count after their feedback. */
  completeRound(feedbackMs: number, countImmediately?: boolean): void;
  setDescription(text: string): void;
  setDebugText(text: string): void;
}

export interface ExerciseSession {
  startRound(): void;
  keyDown?(event: KeyboardEvent): void;
  keyUp?(event: KeyboardEvent): void;
  isPreparing?(): boolean;
  dispose?(): void;
}
