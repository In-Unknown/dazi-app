import { defineListeningChapter } from '../../features/listening/chapter';
import { NASAL_FINALS, NASAL_FINALS_CONFUSABLE } from '../../data/pinyin';
import { PINYIN_AUDIO_POOL } from '../../audio/pinyin';

/**
 * 第 25 章 · 鼻韵母。
 * 16 个鼻韵母（前/后鼻音），机制与单韵母章一致；ün 显示为 ün、音频按 vn 命名。
 */
export default defineListeningChapter({
  id: 'pinyin-nasal-finals',
  title: '鼻韵母',
  desc: '学习页逐个试听 16 个鼻韵母；听音配对整组完成后各加1分，错配只扣当前韵母1分；最终进度100%通关',
  defaultCaps: false,
  questions: {
    symbols: NASAL_FINALS,
    audioPool: NASAL_FINALS,
    audio: PINYIN_AUDIO_POOL,
    confusable: NASAL_FINALS_CONFUSABLE,
    label: '韵母',
    boardTargets: 4,
    boardAudios: 6,
    choiceAudios: 4,
    maxTierExtraAudios: 2,
  },
});
