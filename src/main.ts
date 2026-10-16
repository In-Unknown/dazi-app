import './styles/index.css';
import { createApplication } from './app/controller';
import { CH } from './chapters/catalog';
import { getAudioContext } from './audio/context';
import { prepareLetterAudio } from './audio/pronunciation';
import { prepareSymbolAudio } from './audio/symbol-audio';
import { PINYIN_AUDIO_POOL } from './audio/pinyin';
import { installKeyboard } from './input/keyboard';
import { installDebugPanel } from './ui/debug';
import { installCorpusImport } from './ui/import-corpus';
import { createUI } from './ui/elements';
import { $ } from './ui/dom';

const ui = createUI();
const { overlay, fileInfo } = ui;
const application = createApplication(CH, ui);
const listeners = new AbortController();
installKeyboard(overlay, application, listeners.signal);
installDebugPanel(ui, listeners.signal);
installCorpusImport(ui, listeners.signal);
const prepareAllAudio = () =>
  Promise.all([prepareLetterAudio(), prepareSymbolAudio(PINYIN_AUDIO_POOL)]).then(() => undefined);
prepareAllAudio().catch((error) => console.warn('音频准备失败:', error));
const start = $<HTMLButtonElement>('#startBtn');
start.addEventListener(
  'click',
  async () => {
    getAudioContext();
    start.disabled = true;
    try {
      await prepareAllAudio();
    } catch {
      fileInfo.textContent = '发音未能准备，请点击开始重试。';
      start.disabled = false;
      return;
    }
    start.disabled = false;
    overlay.classList.add('hide');
    application.startChapter(0);
  },
  { signal: listeners.signal },
);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    listeners.abort();
    application.dispose();
  });
