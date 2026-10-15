import initialSentences from './sentences.json';
let sentences: string[] = [...initialSentences];
export const getSentences = () => sentences;
export function replaceSentences(lines: string[]) {
  if (!lines.length) throw new Error('语料不能为空');
  sentences = [...lines];
}
