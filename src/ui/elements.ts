import { $ } from './dom';
import { mountShell } from './shell';

/** Mount explicitly at bootstrap; importing chapters has no DOM side effects. */
export function createUI() {
  mountShell();
  return {
    targetEl: $('#target'),
    promptEl: $('#prompt'),
    hintEl: $('#hint'),
    barEl: $('#bar'),
    chTitleEl: $('#chTitle'),
    chDescEl: $('#chDesc'),
    tierEl: $('#tier'),
    roundEl: $('#round'),
    errEl: $('#err'),
    overlay: $('#overlay'),
    flashEl: $('#flash'),
    timelineEl: $('#timeline'),
    imeModeEl: $('#imeMode'),
    capsModeEl: $('#capsMode'),
    fileInput: $<HTMLInputElement>('#fileInput'),
    fileInfo: $('#fileInfo'),
    debugPanel: $('#debugPanel'),
    debugToggle: $('#debugToggle'),
    dbgList: $('#dbgList'),
    dbgTiers: $('#dbgTiers'),
  };
}
export type UIElements = ReturnType<typeof createUI>;
