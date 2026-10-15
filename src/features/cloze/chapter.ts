import { defineChapter, type ChapterMetadata } from '../../chapters/schema';
import { ALL_LETTERS } from '../../data/alphabet';
import { ALPHABET_PRACTICE_ROUNDS } from '../../data/rules';
import { masteryPolicy, type MasteryConfig } from '../../domain/policy';
import { createClozeSession } from './driver';
import {
  validateAlphabet,
  validatePreparation,
  type PreparationOptions,
} from '../preparation/options';
export interface ClozeOptions {
  symbols: readonly string[];
  gapLength: number;
  contextLength: number;
  successMs: number;
  retryMs: number;
}
export interface ClozeConfig extends ChapterMetadata {
  defaultCaps?: true;
  questions?: Partial<ClozeOptions>;
  mastery?: MasteryConfig;
  preparation?: false | Partial<Pick<PreparationOptions, 'rounds' | 'nextRoundMs'>>;
}
export function defineClozeChapter(config: ClozeConfig) {
  const options: ClozeOptions = {
    symbols: ALL_LETTERS,
    gapLength: 3,
    contextLength: 2,
    successMs: 650,
    retryMs: 1000,
    ...config.questions,
  };
  validateAlphabet(options.symbols);
  if (
    !Number.isInteger(options.gapLength) ||
    options.gapLength < 1 ||
    options.gapLength > options.symbols.length ||
    !Number.isInteger(options.contextLength) ||
    options.contextLength < 0 ||
    [options.successMs, options.retryMs].some((n) => !Number.isFinite(n) || n < 0)
  )
    throw new Error('Invalid cloze gaps, context or timing');
  const keys = Array.from({ length: options.symbols.length - options.gapLength + 1 }, (_, i) =>
    options.symbols.slice(i, i + options.gapLength).join(''),
  );
  const preparation: PreparationOptions = {
    mode: 'sequence',
    symbols: options.symbols,
    rounds: ALPHABET_PRACTICE_ROUNDS,
    nextRoundMs: 450,
    enabled: config.preparation !== false,
    ...(config.preparation || {}),
  };
  validatePreparation(preparation);
  return defineChapter({
    ...config,
    defaultCaps: config.defaultCaps ?? true,
    kind: 'cloze',
    layout: 'letters',
    progress: masteryPolicy(keys, config.mastery),
    create: (context) => createClozeSession(context, options, preparation),
  });
}
