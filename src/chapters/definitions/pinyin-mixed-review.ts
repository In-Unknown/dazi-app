import { defineListeningChapter } from '../../features/listening/chapter';
import { MIXED_REVIEW, PINYIN_MIXED_CONFUSABLE } from '../../data/pinyin';
import { PINYIN_AUDIO_POOL } from '../../audio/pinyin';

/**
 * 第 26 章 · 混合复习。
 * 混合前四章（单韵母、声母、复韵母、鼻韵母）全部音素，机制与各章一致，
 * 熟练度/博学度/进度按本章 id 独立。
 */
export default defineListeningChapter({
  id: 'pinyin-mixed-review',
  title: '混合复习',
  desc: '混合前四章全部音素，学习页逐个试听；听音配对整组完成后各加1分，错配只扣当前音素1分；最终进度100%通关',
  defaultCaps: false,
  questions: {
    symbols: MIXED_REVIEW,
    audioPool: MIXED_REVIEW,
    audio: PINYIN_AUDIO_POOL,
    confusable: PINYIN_MIXED_CONFUSABLE,
    label: '音素',
    boardTargets: 4,
    boardAudios: 6,
    choiceAudios: 4,
    maxTierExtraAudios: 2,
  },
});
