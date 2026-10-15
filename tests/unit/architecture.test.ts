import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sources(file) : file.endsWith('.ts') ? [file] : [];
  });
}
function imports(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  return source.statements.flatMap((statement) =>
    ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)
      ? [statement.moduleSpecifier.text]
      : [],
  );
}

describe('maintainable dependency boundaries', () => {
  it('features depend on the public contract, never course state, catalog or other exercises', () => {
    const failures: string[] = [];
    const features = path.resolve('src/features');
    for (const file of sources(features)) {
      const ownFeature = path.relative(features, file).split(path.sep)[0];
      for (const dependency of imports(file)) {
        const resolved = path.resolve(path.dirname(file), dependency).replaceAll('\\', '/');
        if (/\/app\/|\/chapters\/(catalog|order|definitions)/.test(resolved))
          failures.push(`${file} → ${dependency}`);
        const otherFeature = resolved.match(/\/features\/([^/]+)\//)?.[1];
        // Preparation is a shared component with its own public options/session factory.
        if (otherFeature && otherFeature !== ownFeature && otherFeature !== 'preparation')
          failures.push(`${file} → ${dependency}`);
      }
    }
    expect(failures).toEqual([]);
  });
  it('course, keyboard and shared UI have no dependency on any concrete feature', () => {
    const files = [...sources('src/app'), ...sources('src/input'), ...sources('src/ui')];
    expect(
      files.flatMap((file) =>
        imports(file)
          .filter((dep) => dep.includes('/features/'))
          .map((dep) => `${file} → ${dep}`),
      ),
    ).toEqual([]);
  });
});
