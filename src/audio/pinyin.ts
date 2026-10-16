import { PINYIN_AUDIO_URLS } from './assets';
import type { SymbolAudioPool } from './symbol-audio';

/** 拼音音素音频池：显示用 ü，音频按键盘友好的 v 命名（üe→ve、üan→van、ün→vn）。 */
export const PINYIN_AUDIO_POOL: SymbolAudioPool = {
  id: 'pinyin',
  urls: PINYIN_AUDIO_URLS,
  keyOf: (symbol) => symbol.replace(/ü/g, 'v'),
};
