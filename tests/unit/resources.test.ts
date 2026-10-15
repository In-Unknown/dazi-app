import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { format } from 'prettier';

const original = readFileSync('tests/fixtures/baseline.html', 'utf8');
describe('migration resource fidelity', () => {
  it('keeps every CSS rule in its original cascade order', async () => {
    const css = original.match(/<style>([\s\S]*?)<\/style>/)![1];
    const combined = ['base', 'progress', 'typing', 'overlays', 'lessons']
      .map((name) => readFileSync(`src/styles/${name}.css`, 'utf8'))
      .join('');
    const normalize = async (value: string) =>
      (
        await format(value.replace(/\/\*[\s\S]*?\*\//g, ''), { parser: 'css', singleQuote: true })
      ).replace(/\s+/g, '');
    expect(await normalize(combined)).toBe(await normalize(css));
  });
  it('extracts all 26 recordings without changing a byte', () => {
    const literal = original.match(/const LETTER_AUDIO_DATA\s*=\s*(\{[\s\S]*?\});/)![1];
    const recordings: Record<string, string> = JSON.parse(literal);
    expect(Object.keys(recordings)).toHaveLength(26);
    for (const [letter, base64] of Object.entries(recordings)) {
      const asset = readFileSync(`src/assets/audio/${letter}.mp3`);
      expect(asset.equals(Buffer.from(base64, 'base64')), letter).toBe(true);
    }
  });
});
