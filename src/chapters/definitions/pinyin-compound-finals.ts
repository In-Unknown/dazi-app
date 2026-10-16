import { defineListeningChapter } from '../../features/listening/chapter';
import { COMPOUND_FINALS, COMPOUND_FINALS_CONFUSABLE } from '../../data/pinyin';
import { PINYIN_AUDIO_POOL } from '../../audio/pinyin';

/**
 * 第 24 章 · 复韵母。
 * 13 个复韵母，机制与单韵母章一致；üe 显示为 üe、音频按 ve 命名。
 */
export default defineListeningChapter({
  id: 'pinyin-compound-finals',
  title: '复韵母',
  desc: '学习页逐个试听 13 个复韵母；听音配对整组完成后各加1分，错配只扣当前韵母1分；最终进度100%通关',
  defaultCaps: false,
  questions: {
    symbols: COMPOUND_FINALS,
    audioPool: COMPOUND_FINALS,
    audio: PINYIN_AUDIO_POOL,
    confusable: COMPOUND_FINALS_CONFUSABLE,
    label: '韵母',
    boardTargets: 4,
    boardAudios: 6,
    choiceAudios: 4,
    maxTierExtraAudios: 2,
  },
});
