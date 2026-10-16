const letterFiles = import.meta.glob<string>('../assets/audio/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});
const pinyinFiles = import.meta.glob<string>('../assets/pinyin/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** 以文件 basename（去扩展名）为键，便于用符号直接查表。 */
function byBasename(files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([name, url]) => [name.split('/').pop()!.split('.')[0], url]),
  );
}

export const LETTER_AUDIO_URLS: Record<string, string> = byBasename(letterFiles);
export const PINYIN_AUDIO_URLS: Record<string, string> = byBasename(pinyinFiles);
