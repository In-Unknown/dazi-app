import { defineListeningChapter } from '../src/features/listening/chapter';
import { defineClozeChapter } from '../src/features/cloze/chapter';

// Examples are typechecked and exercised by tests, but not loaded by the live catalog.
export const sxListening = defineListeningChapter({
  id: 'sx-example',
  title: 'S / X 辨音示例',
  desc: '两个目标，四个发音，完成后每个目标加 2 分',
  questions: {
    symbols: ['S', 'X'],
    audioPool: ['S', 'X', 'H', 'N'],
    confusable: [
      ['S', 'X'],
      ['H', 'N'],
    ],
    mix: ['contrast'],
  },
  mastery: { standard: 4, reward: 2 },
  preparation: false,
});

export const shortCloze = defineClozeChapter({
  id: 'short-cloze-example',
  title: '短序列填空示例',
  desc: '先练两轮 A–D，然后填写连续两个字母',
  questions: { symbols: ['A', 'B', 'C', 'D'], gapLength: 2, contextLength: 1 },
  preparation: { rounds: 2, nextRoundMs: 50 },
  mastery: { standard: 3, minimumMultiplier: 2, alpha: 0.1 },
});
