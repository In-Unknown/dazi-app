import { getAudioContext } from './context';

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);

      // 钟琴弹力淡出包络
      gain.gain.setValueAtTime(0, now + i * 0.055);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.055 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + (i === 3 ? 0.38 : 0.16));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + (i === 3 ? 0.4 : 0.18));
    });
  } catch (e) {
    console.warn('音效播放受阻:', e);
  }
}

export function playKeySuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch (e) {
    console.warn('按键提示音播放受阻:', e);
  }
}

export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const drops = [
      { start: 240, end: 160, time: 0 },
      { start: 180, end: 110, time: 0.1 },
    ];

    drops.forEach((d) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // 三角波，音色沉闷厚实
      osc.frequency.setValueAtTime(d.start, now + d.time);
      osc.frequency.exponentialRampToValueAtTime(d.end, now + d.time + 0.12);

      gain.gain.setValueAtTime(0, now + d.time);
      gain.gain.linearRampToValueAtTime(0.22, now + d.time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + d.time + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + d.time);
      osc.stop(now + d.time + 0.15);
    });
  } catch (e) {
    console.warn('音效播放受阻:', e);
  }
}
