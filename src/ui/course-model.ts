import type { ChapterDefinition } from '../chapters/schema';
import type { MasterySnapshot } from '../domain/mastery';
export interface CourseViewModel {
  readonly chapters: readonly ChapterDefinition[];
  readonly chapterIndex: number;
  readonly round: number;
  readonly tier: number;
  readonly errors: number;
  mastery(index: number): MasterySnapshot | null;
}
export interface CourseActions {
  startChapter(index: number): void;
  setTier(index: number): void;
}
