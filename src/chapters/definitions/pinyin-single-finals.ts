import { defineListeningChapter } from '../../features/listening/chapter';
import { SINGLE_FINALS, SINGLE_FINALS_CONFUSABLE } from '../../data/pinyin';
import { PINYIN_AUDIO_POOL } from '../../audio/pinyin';

/**
 * 第 22 章 · 单韵母。
 * 复用 preparation(listen) 学习页与 listening 听音配对；符号、音频、易混对均为拼音音素。
 * 各章熟练度数据由 scorebook 按本章 id 隔离，不与字母章共享。
 */
export default defineListeningChapter({
  id: 'pinyin-single-finals',
  title: '单韵母',
  desc: '学习页逐个试听 a o e i u ü；听音配对整组完成后各加1分，错配只扣当前韵母1分；最终进度100%通关',
  defaultCaps: false,
  questions: {
    symbols: SINGLE_FINALS,
    audioPool: SINGLE_FINALS,
    audio: PINYIN_AUDIO_POOL,
    confusable: SINGLE_FINALS_CONFUSABLE,
    label: '韵母',
    boardTargets: 3,
    boardAudios: 5,
    choiceAudios: 3,
    maxTierExtraAudios: 1,
  },
  preparation: {
    promptNote: '它们与字母读音不同',
  },
});
