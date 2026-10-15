import { defineChapter, type ChapterMetadata } from '../../chapters/schema';
import { ALL_LETTERS } from '../../data/alphabet';
import { CONFUSABLE_LETTERS } from '../../data/listening';
import { masteryPolicy, type MasteryConfig } from '../../domain/policy';
import type { MatchType } from './types';
import { createListeningSession } from './driver';
import {
  validateAlphabet,
  validatePreparation,
  type PreparationOptions,
} from '../preparation/options';

export interface ListeningOptions {
  symbols: readonly string[];
  audioPool: readonly string[];
  confusable: readonly string[];
  mix: readonly MatchType[];
  boardTargets: number;
  boardAudios: number;
  choiceAudios: number;
  maxTierExtraAudios: number;
  successMs: number;
  wrongMs: number;
}
export interface ListeningConfig extends ChapterMetadata {
  defaultCaps?: true;
  questions?: Partial<ListeningOptions>;
  mastery?: MasteryConfig;
  preparation?: false | Partial<Pick<PreparationOptions, 'symbols'>>;
}
export const LISTENING_DEFAULTS: Readonly<ListeningOptions> = {
  symbols: ALL_LETTERS,
  audioPool: ALL_LETTERS,
  confusable: CONFUSABLE_LETTERS,
  mix: ['board', 'single', 'contrast', 'single', 'contrast'],
  boardTargets: 5,
  boardAudios: 7,
  choiceAudios: 4,
  maxTierExtraAudios: 2,
  successMs: 600,
  wrongMs: 450,
};
export function defineListeningChapter(config: ListeningConfig) {
  const options = { ...LISTENING_DEFAULTS, ...config.questions };
  validateAlphabet(options.symbols);
  validateAlphabet(options.audioPool);
  if (!options.symbols.every((l) => options.audioPool.includes(l)))
    throw new Error('Audio pool must contain all targets');
  if (!options.mix.length || options.mix.some((t) => !['board', 'single', 'contrast'].includes(t)))
    throw new Error('Invalid listening mix');
  if (options.mix.includes('contrast') && options.symbols.length < 2)
    throw new Error('Contrast needs two target letters');
  if (
    [options.boardTargets, options.boardAudios, options.choiceAudios].some(
      (n) => !Number.isInteger(n) || n < 1,
    ) ||
    options.boardAudios <= Math.min(options.boardTargets, options.symbols.length) ||
    options.choiceAudios <= (options.mix.includes('contrast') ? 2 : 1) ||
    !Number.isInteger(options.maxTierExtraAudios) ||
    options.maxTierExtraAudios < 0 ||
    [options.successMs, options.wrongMs].some((n) => !Number.isFinite(n) || n < 0)
  )
    throw new Error('Invalid listening counts or timing');
  if (
    options.audioPool.length <= Math.min(options.boardTargets, options.symbols.length) &&
    options.mix.includes('board')
  )
    throw new Error('Board needs distractor audio');
  if (
    options.audioPool.length <= (options.mix.includes('contrast') ? 2 : 1) &&
    options.mix.some((t) => t !== 'board')
  )
    throw new Error('Choices need distractor audio');
  if (
    options.confusable.some(
      (pair) => pair.length !== 2 || pair[0] === pair[1] || !/^[A-Z]{2}$/.test(pair),
    )
  )
    throw new Error('Invalid confusable pair');
  const preparation: PreparationOptions = {
    mode: 'listen',
    symbols: options.symbols,
    rounds: 1,
    nextRoundMs: 450,
    enabled: config.preparation !== false,
    ...(config.preparation || {}),
  };
  validatePreparation(preparation);
  const progress = masteryPolicy(options.symbols, config.mastery);
  return defineChapter({
    ...config,
    defaultCaps: config.defaultCaps ?? true,
    kind: 'listening',
    layout: 'letters',
    progress,
    create: (context) => createListeningSession(context, options, preparation),
  });
}
