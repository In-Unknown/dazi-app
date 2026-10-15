export const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function rndUpper(n: number) {
  let s = '';
  for (let i = 0; i < n; i++) s += String.fromCharCode(65 + randInt(0, 25));
  return s;
}

export function rndLower(n: number) {
  return rndUpper(n).toLowerCase();
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
