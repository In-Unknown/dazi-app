import type { MatchType } from './types';
import type { ListeningOptions } from './chapter';
import { shuffle } from '../../core/random';
export function createMatchSequence(mix: readonly MatchType[]) {
  const state: { typeQueue: MatchType[]; lastType: MatchType | '' } = {
    typeQueue: [],
    lastType: '',
  };

  function nextMatchType(): MatchType {
    if (!state.typeQueue.length) {
      state.typeQueue = shuffle([...mix]);
    }
    if (state.typeQueue[0] === state.lastType) {
      const different = state.typeQueue.findIndex((type) => type !== state.lastType);
      if (different > 0)
        [state.typeQueue[0], state.typeQueue[different]] = [
          state.typeQueue[different],
          state.typeQueue[0],
        ];
    }
    state.lastType = state.typeQueue.shift()!;
    return state.lastType;
  }

  return nextMatchType;
}
export function makeMatchQuestion(
  options: ListeningOptions,
  scores: Readonly<Record<string, number>>,
  standard: number,
  tier: number,
  type: MatchType,
) {
  const { symbols, audioPool, confusable } = options;
  const weak = shuffle(symbols.filter((l) => (scores[l] || 0) < standard));
  const review = shuffle(symbols.filter((l) => (scores[l] || 0) >= standard));
  let targets: string[];
  if (type === 'board') {
    const count = Math.min(options.boardTargets, symbols.length);
    const reviewSlots = review.length && count > 1 ? 1 : 0;
    targets = weak.slice(0, count - reviewSlots);
    targets.push(...review.slice(0, count - targets.length));
  } else {
    const anchor = weak[0] || review[0];
    targets = [anchor];
    if (type === 'contrast') {
      const pairs = shuffle(
        confusable.filter(
          (pair) => pair.includes(anchor) && [...pair].every((l) => symbols.includes(l)),
        ),
      );
      const pair = pairs[0];
      targets.push(
        pair
          ? [...pair].find((l) => l !== anchor)!
          : [...weak, ...review].find((l) => l !== anchor)!,
      );
    }
  }
  const related = shuffle([
    ...new Set(confusable.filter((pair) => targets.some((l) => pair.includes(l))).join('')),
  ]).filter((l) => !targets.includes(l) && audioPool.includes(l));
  const others = shuffle(audioPool.filter((l) => !targets.includes(l) && !related.includes(l)));
  const audioCount =
    type === 'board'
      ? options.boardAudios
      : options.choiceAudios + Math.min(tier, options.maxTierExtraAudios);
  const audios = shuffle([
    ...targets,
    ...[...related, ...others].slice(0, audioCount - targets.length),
  ]);
  return { type, targets: shuffle(targets), audios };
}
