const files = import.meta.glob<string>('../assets/audio/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});
export const LETTER_AUDIO_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([name, url]) => [name.split('/').pop()!.split('.')[0], url]),
);
