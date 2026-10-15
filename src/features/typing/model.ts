import type { RoundContent, TypingStep, StepElements } from './types';

/** One model per chapter visit. Only typing modules can see these details. */
export interface TypingModel {
  roundList: RoundContent[];
  prompt: string;
  hint: string;
  running: boolean;
  locked: boolean;
  limit: number;
  deadline: number;
  raf: number;
  typing: {
    items: TypingStep[];
    elements: StepElements[];
    promptCharacters: HTMLElement[];
    promptWords: Record<string, HTMLElement>;
    mapsPrompt: boolean;
    position: number;
    topRow: HTMLElement | null;
    bottomRow: HTMLElement | null;
  };
}
export function createTypingModel(roundList: RoundContent[]): TypingModel {
  return {
    roundList,
    prompt: '',
    hint: '',
    running: false,
    locked: false,
    limit: 0,
    deadline: 0,
    raf: 0,
    typing: {
      items: [],
      elements: [],
      promptCharacters: [],
      promptWords: {},
      mapsPrompt: false,
      position: 0,
      topRow: null,
      bottomRow: null,
    },
  };
}
