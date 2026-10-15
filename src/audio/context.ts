export let audioCtx: AudioContext | null = null;

export function getAudioContext(wake = true) {
  if (!audioCtx) {
    const Context =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
    audioCtx = new Context({ latencyHint: 'interactive' });
  }
  if (wake && audioCtx.state === 'suspended') {
    audioCtx.resume().catch((e) => console.warn('音频初始化受阻:', e));
  }
  return audioCtx;
}
