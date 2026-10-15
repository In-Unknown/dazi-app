import { defineChapter, type ChapterDefinition, type ChapterMetadata } from '../../chapters/schema';
import type { PromptMode, RoundContent } from './types';
import { createTypingSession } from './driver';

export interface TypingTiming {
  baseMs: number;
  perStepMs: number;
  successMs: number;
  retryMs: number;
}
export interface TypingConfig extends ChapterMetadata {
  compiler: 'sequence' | 'prompt';
  rounds?: number;
  isBlankLineMode?: boolean;
  mode?: PromptMode;
  gen?: () => RoundContent;
  buildList?: () => RoundContent[];
  timing?: Partial<TypingTiming>;
}
export type TypingOptions = Omit<TypingConfig, 'rounds' | 'timing'> & {
  rounds: number;
  timing: TypingTiming;
};
export type TypingChapter = ChapterDefinition & TypingOptions & { kind: 'typing' };

export function defineTypingChapter(config: TypingConfig): TypingChapter {
  if (!config.gen && !config.buildList) throw new Error(`Chapter ${config.id} needs content`);
  const timing = { baseMs: 1800, perStepMs: 1100, successMs: 480, retryMs: 1000, ...config.timing };
  if (Object.values(timing).some((n) => !Number.isFinite(n) || n < 0) || timing.baseMs <= 0)
    throw new Error(`Invalid typing timing: ${config.id}`);
  const options = { ...config, rounds: config.rounds ?? 15, timing };
  return defineChapter({
    ...options,
    kind: 'typing',
    layout: 'typing',
    progress: { type: 'rounds', count: options.rounds },
    create: (context) => createTypingSession(context, options),
  });
}
export function isTypingChapter(chapter: ChapterDefinition): chapter is TypingChapter {
  return chapter.kind === 'typing';
}
