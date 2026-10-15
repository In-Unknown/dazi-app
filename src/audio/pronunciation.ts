import { getAudioContext } from './context';
import { LETTER_AUDIO_URLS } from './assets';

export const letterAudioBuffers = new Map<string, { buffer: AudioBuffer; offset: number }>();

export let letterAudioReady: Promise<void[]> | null = null;

export function prepareLetterAudio() {
  if (!letterAudioReady) {
    const ctx = getAudioContext(false);
    letterAudioReady = Promise.all(
      Object.entries(LETTER_AUDIO_URLS).map(async ([letter, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('发音文件读取失败：' + letter);
        const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
        const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
          buffer.getChannelData(i),
        );
        let firstSound = 0;
        // 只跳过开头的近静音，保留12ms余量保护起音；不裁切字音或改变语速。
        for (let i = 0; i < buffer.length; i++) {
          if (channels.some((channel) => Math.abs(channel[i]) > 0.0003)) {
            firstSound = Math.max(0, i / buffer.sampleRate - 0.012);
            break;
          }
        }
        letterAudioBuffers.set(letter, { buffer, offset: firstSound });
      }),
    ).catch((error) => {
      letterAudioReady = null;
      throw error;
    });
  }
  return letterAudioReady;
}

export let activeLetterAudio: AudioBufferSourceNode | null = null;

export let activeAudioControl: HTMLElement | null = null;

export let letterPlaybackId = 0;

export function stopLetterAudio() {
  letterPlaybackId++;
  if (activeLetterAudio) {
    activeLetterAudio.onended = null;
    activeLetterAudio.stop();
    activeLetterAudio.disconnect();
  }
  if (activeAudioControl) activeAudioControl.classList.remove('playing');
  activeLetterAudio = null;
  activeAudioControl = null;
}

export async function playLetterAudio(letter: string, control?: HTMLElement) {
  const key = letter.toUpperCase();
  if (!LETTER_AUDIO_URLS[key]) return;
  stopLetterAudio();
  const requestId = letterPlaybackId;
  try {
    const ctx = getAudioContext(false);
    await Promise.all([prepareLetterAudio(), ctx.state === 'running' ? null : ctx.resume()]);
    // 连点、配对完成或切换页面后，取消尚未开始的旧发音。
    if (requestId !== letterPlaybackId) return;
    const { buffer, offset } = letterAudioBuffers.get(key)!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    activeLetterAudio = source;
    activeAudioControl = control || null;
    source.onended = () => {
      if (activeLetterAudio === source) stopLetterAudio();
    };
    source.start(0, offset);
    if (control) control.classList.add('playing');
  } catch (e) {
    if (requestId === letterPlaybackId) stopLetterAudio();
    console.warn('字母发音未能播放:', e);
  }
}
