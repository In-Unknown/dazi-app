import type { ExerciseContext, ExerciseSession } from '../exercises/contracts';
import type { MasteryPolicy } from '../domain/scorebook';

export interface ChapterMetadata {
  id: string;
  title: string;
  desc: string;
  defaultCaps?: boolean;
}
export type ProgressPolicy = { type: 'rounds'; count: number } | MasteryPolicy;

/** A feature binds its own factory. The course never dispatches on kind or array position. */
export interface ChapterDefinition extends ChapterMetadata {
  kind: string;
  layout: 'typing' | 'letters';
  progress: ProgressPolicy;
  create(context: ExerciseContext): ExerciseSession;
}

export function defineChapter<T extends ChapterDefinition>(chapter: T): T {
  if (!/^[a-z][a-z0-9-]*$/.test(chapter.id)) throw new Error(`Invalid chapter ID: ${chapter.id}`);
  if (!chapter.title || !chapter.desc)
    throw new Error(`Chapter ${chapter.id} needs a title and description`);
  if (!chapter.kind || typeof chapter.create !== 'function')
    throw new Error(`Chapter ${chapter.id} needs a feature factory`);
  const policy = chapter.progress;
  if (policy.type === 'rounds') {
    if (!Number.isInteger(policy.count) || policy.count < 1)
      throw new Error(`Invalid rounds: ${chapter.id}`);
  } else {
    if (!policy.keys.length || policy.keys.some((key) => !key))
      throw new Error(`Chapter ${chapter.id} needs mastery keys`);
    if (new Set(policy.keys).size !== policy.keys.length)
      throw new Error(`Duplicate mastery keys: ${chapter.id}`);
    const { standard, minimumMultiplier, alpha } = policy.rules;
    if (
      ![standard, minimumMultiplier, alpha, policy.reward, policy.penalty].every(Number.isFinite) ||
      standard <= 0 ||
      minimumMultiplier <= 0 ||
      alpha < 0 ||
      policy.reward <= 0 ||
      policy.penalty <= 0
    )
      throw new Error(`Invalid mastery policy: ${chapter.id}`);
  }
  return chapter;
}
export function assembleChapters(
  definitions: ChapterDefinition[],
  order: readonly string[],
): ChapterDefinition[] {
  const catalog = new Map<string, ChapterDefinition>();
  for (const chapter of definitions) {
    defineChapter(chapter);
    if (catalog.has(chapter.id)) throw new Error(`Duplicate chapter ID: ${chapter.id}`);
    catalog.set(chapter.id, chapter);
  }
  if (!order.length) throw new Error('Enable at least one chapter');
  if (new Set(order).size !== order.length) throw new Error('Duplicate IDs in chapter order');
  return order.map((id) => {
    const chapter = catalog.get(id);
    if (!chapter) throw new Error(`Unknown chapter ID in order: ${id}`);
    return chapter;
  });
}
