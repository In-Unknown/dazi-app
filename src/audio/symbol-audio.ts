import { getAudioContext } from './context';

/** 一组可发声符号的音频来源。字母与拼音共用同一引擎，只有 urls/keyOf 不同。 */
export interface SymbolAudioPool {
  readonly id: string;
  readonly urls: Readonly<Record<string, string>>;
  /** 显示符号 → URL 键；默认原样。用于 ü→v 这类键盘友好映射。 */
  readonly keyOf?: (symbol: string) => string;
}

interface DecodedAudio {
  buffer: AudioBuffer;
  offset: number;
}

const buffers = new Map<string, DecodedAudio>();
const poolReady = new Map<string, Promise<void>>();
let activeSource: AudioBufferSourceNode | null = null;
let activeControl: HTMLElement | null = null;
let playbackId = 0;

const urlKeyOf = (pool: SymbolAudioPool, symbol: string) =>
  (pool.keyOf ?? ((s: string) => s))(symbol);
const bufferKeyOf = (pool: SymbolAudioPool, urlKey: string) => `${pool.id}::${urlKey}`;

/** 预解码整池音频；同一池只加载一次，失败后允许重试。 */
export function prepareSymbolAudio(pool: SymbolAudioPool): Promise<void> {
  let ready = poolReady.get(pool.id);
  if (!ready) {
    const ctx = getAudioContext(false);
    ready = Promise.all(
      Object.entries(pool.urls).map(async ([key, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('发音文件读取失败：' + key);
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
        buffers.set(bufferKeyOf(pool, key), { buffer, offset: firstSound });
      }),
    )
      .then(() => undefined)
      .catch((error) => {
        poolReady.delete(pool.id);
        throw error;
      });
    poolReady.set(pool.id, ready);
  }
  return ready;
}

export function stopSymbolAudio() {
  playbackId++;
  if (activeSource) {
    activeSource.onended = null;
    activeSource.stop();
    activeSource.disconnect();
  }
  if (activeControl) activeControl.classList.remove('playing');
  activeSource = null;
  activeControl = null;
}

/** 已解码音频的实际可播放时长（毫秒，已扣除开头静音）；未准备好时返回 null。 */
export function symbolAudioDurationMs(pool: SymbolAudioPool, symbol: string): number | null {
  const urlKey = urlKeyOf(pool, symbol);
  if (!(urlKey in pool.urls)) return null;
  const decoded = buffers.get(bufferKeyOf(pool, urlKey));
  if (!decoded) return null;
  return Math.max(0, (decoded.buffer.duration - decoded.offset) * 1000);
}

export async function playSymbolAudio(
  pool: SymbolAudioPool,
  symbol: string,
  control?: HTMLElement,
) {
  const urlKey = urlKeyOf(pool, symbol);
  if (!(urlKey in pool.urls)) return;
  stopSymbolAudio();
  const requestId = playbackId;
  try {
    const ctx = getAudioContext(false);
    await Promise.all([prepareSymbolAudio(pool), ctx.state === 'running' ? null : ctx.resume()]);
    // 连点、配对完成或切换页面后，取消尚未开始的旧发音。
    if (requestId !== playbackId) return;
    const decoded = buffers.get(bufferKeyOf(pool, urlKey));
    if (!decoded) return;
    const source = ctx.createBufferSource();
    source.buffer = decoded.buffer;
    source.connect(ctx.destination);
    activeSource = source;
    activeControl = control || null;
    source.onended = () => {
      if (activeSource === source) stopSymbolAudio();
    };
    source.start(0, decoded.offset);
    if (control) control.classList.add('playing');
  } catch (e) {
    if (requestId === playbackId) stopSymbolAudio();
    console.warn('符号发音未能播放:', e);
  }
}
