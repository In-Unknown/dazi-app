export function createClozeModel() {
  return {
    locked: false,
    input: [] as string[],
    target: '',
    showHints: false,
    queue: [] as string[],
    lastTarget: '',
  };
}
export type ClozeModel = ReturnType<typeof createClozeModel>;
