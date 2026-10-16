import { defineListeningChapter } from '../../features/listening/chapter';
import { INITIALS, INITIALS_CONFUSABLE } from '../../data/pinyin';
import { PINYIN_AUDIO_POOL } from '../../audio/pinyin';

/**
 * 第 23 章 · 单声母。
 * 21 个传统声母（不含 y、w），机制与单韵母章一致，音频为呼读音。
 */
export default defineListeningChapter({
  id: 'pinyin-initials',
  title: '单声母',
  desc: '学习页逐个试听 21 个声母；听音配对整组完成后各加1分，错配只扣当前声母1分；最终进度100%通关',
  defaultCaps: false,
  questions: {
    symbols: INITIALS,
    audioPool: INITIALS,
    audio: PINYIN_AUDIO_POOL,
    confusable: INITIALS_CONFUSABLE,
    label: '声母',
    boardTargets: 4,
    boardAudios: 6,
    choiceAudios: 4,
    maxTierExtraAudios: 2,
  },
  preparation: {
    promptNote: '它们与字母读音不同',
  },
});
