import { createServer } from 'vite';

// Use the same catalog loader and validation as the browser, not a second list.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { CH } = await server.ssrLoadModule('/src/chapters/catalog.ts');
  const rows = CH.map((chapter, index) => ({
    number: index + 1,
    id: chapter.id,
    title: chapter.title,
    kind: chapter.kind,
    compiler: chapter.compiler ?? '—',
    rounds: chapter.progress.type === 'mastery' ? '熟练度达标' : chapter.progress.count,
  }));
  if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 2));
  else console.table(rows);
} finally {
  await server.close();
}
