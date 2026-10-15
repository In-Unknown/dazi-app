export type MatchType = 'board' | 'single' | 'contrast';
export interface MatchQuestion {
  type: MatchType;
  targets: string[];
  audios: string[];
}
