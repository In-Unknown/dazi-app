import { assembleChapters, type ChapterDefinition } from './schema';
import { chapterOrder } from './order';

const definitions = import.meta.glob<ChapterDefinition>('./definitions/*.ts', {
  eager: true,
  import: 'default',
});
export const CH = assembleChapters(Object.values(definitions), chapterOrder);
