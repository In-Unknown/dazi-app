export type PromptMode = 'full' | 'abbrev' | 'mixed-abbrev' | 'mixed' | 'multiline';
export interface RoundContent {
  text?: string;
  prompt?: string;
  hint?: string;
  mode?: PromptMode;
}
import type { InputMethod } from '../../input/mode';
export type StepType = 'char' | 'sp' | 'nl' | 'caps-down' | 'caps-up' | 'shift-down' | 'shift-up';
interface StepContext {
  promptCharIdx?: number;
  promptWordId?: string;
  promptAction?: 'abbrev-char' | 'word-confirm' | 'pinyin-letter' | 'char-confirm' | 'direct-char';
  promptLineBreak?: boolean;
  isOpeningIme?: boolean;
  isImeToggle?: boolean;
  hint?: string;
  color?: 'blue' | 'orange';
  expected?: 'CapsLock' | 'Shift';
}
export type TypingStep = StepContext &
  (
    | {
        type: 'char';
        display: string;
        baseKey: string;
        shift: boolean | null;
        requiredIme?: InputMethod;
      }
    | { [K in Exclude<StepType, 'char'>]: { type: K } }[Exclude<StepType, 'char'>]
  );
export interface StepElements {
  stack: HTMLElement;
  main: HTMLElement;
  hint: HTMLElement | null;
  btm?: HTMLElement | null;
}
