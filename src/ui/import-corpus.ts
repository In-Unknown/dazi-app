import { $ } from './dom';
import type { UIElements } from './elements';
import { sanitizeText } from '../content/text';
import { replaceSentences } from '../content/corpus';

export function installCorpusImport(ui: UIElements, signal: AbortSignal) {
  const { fileInput, fileInfo } = ui;
  $('#loadBtn').addEventListener('click', () => fileInput.click(), { signal });
  fileInput.addEventListener(
    'change',
    async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const buffer = await file.arrayBuffer();
        let text = '';
        let encodingUsed = 'UTF-8';

        const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
        text = utf8Decoder.decode(buffer);

        if (text.includes('\uFFFD')) {
          try {
            const gbkDecoder = new TextDecoder('gbk');
            const gbkText = gbkDecoder.decode(buffer);
            const utf8Bad = (text.match(/\uFFFD/g) || []).length;
            const gbkBad = (gbkText.match(/\uFFFD/g) || []).length;
            if (gbkBad < utf8Bad) {
              text = gbkText;
              encodingUsed = 'GBK/ANSI';
            }
          } catch (err) {
            console.warn('浏览器不支持 GBK 解码，请把文件另存为 UTF-8', err);
          }
        }

        const lines = text
          .split(/\r?\n/)
          .map((s) => sanitizeText(s.trim()))
          .filter((s) => s && !s.startsWith('#'));

        if (!lines.length) {
          fileInfo.textContent = '文件为空或未识别到有效内容';
          return;
        }

        replaceSentences(lines);
        fileInfo.textContent = `已加载 ${lines.length} 句（编码：${encodingUsed}）`;
      } catch (err) {
        fileInfo.textContent = '读取失败：' + (err instanceof Error ? err.message : String(err));
      }
    },
    { signal },
  );
}
