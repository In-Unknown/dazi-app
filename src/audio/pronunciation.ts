import { LETTER_AUDIO_URLS } from './assets';
import {
  prepareSymbolAudio,
  playSymbolAudio,
  stopSymbolAudio,
  type SymbolAudioPool,
} from './symbol-audio';

/** 26 个英文字母名的音频池；字母章与听音配对共用。 */
export const LETTER_AUDIO_POOL: SymbolAudioPool = {
  id: 'letter',
  urls: LETTER_AUDIO_URLS,
  keyOf: (symbol) => symbol.toUpperCase(),
};

export const prepareLetterAudio = () => prepareSymbolAudio(LETTER_AUDIO_POOL);
export const stopLetterAudio = stopSymbolAudio;
export const playLetterAudio = (letter: string, control?: HTMLElement) =>
  playSymbolAudio(LETTER_AUDIO_POOL, letter, control);
