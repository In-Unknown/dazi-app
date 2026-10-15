import type { TypingStep } from './types';
import type { PromptMode } from './types';
import { segment, charPinyin, textPinyin } from '../../content/pinyin';
import { getRequiredIme, SYMBOL_MAP } from '../../input/keymap';

export function compilePrompt(promptText: string, mode: PromptMode) {
  const promptFrag = document.createDocumentFragment();
  const items: TypingStep[] = [];
  const charRefs: HTMLElement[] = [];
  const wordRefs: Record<string, HTMLElement> = {};
  let simIme = 'en'; // 物理键盘初始默认英文
  let globalCharIdx = 0;
  let wordCounter = 0;

  const lines = promptText.split('\n');

  for (let l = 0; l < lines.length; l++) {
    const lineText = lines[l];
    if (l > 0) {
      // 提示行插入真实 <br> 保证换行显示
      promptFrag.appendChild(document.createElement('br'));
      // 按键任务流插入真实回车
      items.push({
        type: 'nl',
        promptLineBreak: true,
      });
    }

    const segs = segment(lineText);
    const linePinyin = textPinyin(lineText);
    let hanziOffset = 0;

    for (let sIdx = 0; sIdx < segs.length; sIdx++) {
      const seg = segs[sIdx];

      if (seg.type === 'word') {
        // 全拼与缩写共用完整上下文读音，分词只决定界面分组和确认方式。
        const wordPyList = linePinyin.slice(hanziOffset, hanziOffset + seg.chars.length);
        hanziOffset += seg.chars.length;
        // 中文词语：若当前处于英文模式，状态机自动生成切输入法指令
        if (simIme !== 'zh') {
          items.push({
            type: 'shift-down',
            color: 'blue',
            expected: 'Shift',
            hint: '按下Shift',
            isImeToggle: true,
          });
          items.push({
            type: 'shift-up',
            color: 'blue',
            expected: 'Shift',
            hint: '松开Shift',
            isImeToggle: true,
          });
          simIme = 'zh';
        }

        // 单次决定的录入模式（全拼 vs 缩写）
        let useAbbrev = false;
        if (mode === 'abbrev') useAbbrev = true;
        else if (mode === 'full') useAbbrev = false;
        else if (mode === 'mixed-abbrev') {
          useAbbrev = Math.random() < 0.5;
        }

        const wordId = 'w_' + wordCounter++;
        let wordWrap = null;
        // 缩写模式且字数大于1时，创建整词框选容器
        if (useAbbrev && seg.chars.length > 1) {
          wordWrap = document.createElement('span');
          wordWrap.className = 'p-word';
          wordWrap.id = wordId;
          wordRefs[wordId] = wordWrap;
        }

        const wordCharIndices = [];
        for (let k = 0; k < seg.chars.length; k++) {
          const c = seg.chars[k];
          const cIdx = globalCharIdx++;
          wordCharIndices.push(cIdx);

          const span = document.createElement('span');
          span.className = 'p-char';
          span.textContent = c;
          charRefs[cIdx] = span;

          if (wordWrap) wordWrap.appendChild(span);
          else promptFrag.appendChild(span);
        }
        if (wordWrap) promptFrag.appendChild(wordWrap);

        // 生成该词专属按键序列（按键直接持有汉字 DOM 索引指针）
        if (useAbbrev && seg.chars.length > 1) {
          for (let k = 0; k < seg.chars.length; k++) {
            const cIdx = wordCharIndices[k];
            const py = wordPyList[k] || charPinyin(seg.chars[k]);
            const initial = py && py[0] ? py[0].toLowerCase() : 'a';

            items.push({
              type: 'char',
              display: initial,
              hint: '',
              shift: false,
              baseKey: initial,
              promptCharIdx: cIdx,
              promptWordId: wordId,
              promptAction: 'abbrev-char',
            });
          }
          // 缩写整词确认空格
          items.push({
            type: 'sp',
            promptWordId: wordId,
            promptAction: 'word-confirm',
          });
        } else {
          // 全拼：每个汉字生成音节字母与确认空格
          for (let k = 0; k < seg.chars.length; k++) {
            const cIdx = wordCharIndices[k];
            // 优先取完整上下文结果，取不到才降级单字查
            const py = wordPyList[k] || charPinyin(seg.chars[k]);

            for (let m = 0; m < py.length; m++) {
              const letter = py[m].toLowerCase();
              const isUmlaut = letter === 'ü'; // 检测到 ü 字符

              items.push({
                type: 'char',
                display: isUmlaut ? 'ü' : letter, // 屏幕上依然优雅显示 ü
                hint: isUmlaut ? 'v' : '', // 核心：在下方生成物理按键框标记提示为 "v"
                shift: false,
                baseKey: isUmlaut ? 'v' : letter, // 核心：绑定实际需要敲击的物理键为 "v"
                promptCharIdx: cIdx,
                promptAction: 'pinyin-letter',
              });
            }
            // 单字确认空格（输入后该字彻底变绿）
            items.push({
              type: 'sp',
              promptCharIdx: cIdx,
              promptAction: 'char-confirm',
            });
          }
        }
      } else if (seg.type === 'english') {
        // 英文单词：若当前处于中文状态，状态机自动切至英文
        if (simIme !== 'en') {
          items.push({
            type: 'shift-down',
            color: 'blue',
            expected: 'Shift',
            hint: '按下Shift',
            isImeToggle: true,
          });
          items.push({
            type: 'shift-up',
            color: 'blue',
            expected: 'Shift',
            hint: '松开Shift',
            isImeToggle: true,
          });
          simIme = 'en';
        }

        let k = 0;
        while (k < seg.text.length) {
          // 核心优化：检测是否存在连续的大写字母
          if (seg.text[k] >= 'A' && seg.text[k] <= 'Z') {
            let end = k;
            while (end < seg.text.length && seg.text[end] >= 'A' && seg.text[end] <= 'Z') {
              end++;
            }
            const runLen = end - k; // 连续大写字母长度

            if (runLen >= 2) {
              // 1. 连续 >= 2 个大写字母（如 UTF、HTML）：按一次 CapsLock 锁定大写
              items.push({
                type: 'caps-down',
                color: 'orange',
                expected: 'CapsLock',
                hint: '按下Caps',
              });
              items.push({
                type: 'caps-up',
                color: 'orange',
                expected: 'CapsLock',
                hint: '松开Caps',
              });

              // 2. 依次录入大写字符（CapsLock已开，无需按Shift）
              for (let m = k; m < end; m++) {
                const ch = seg.text[m];
                const cIdx = globalCharIdx++;
                const span = document.createElement('span');
                span.className = 'p-char';
                span.textContent = ch;
                charRefs[cIdx] = span;
                promptFrag.appendChild(span);

                items.push({
                  type: 'char',
                  display: ch,
                  hint: '',
                  shift: false,
                  baseKey: ch.toLowerCase(),
                  promptCharIdx: cIdx,
                  promptAction: 'direct-char',
                });
              }

              // 3. 敲完后再次按 CapsLock 切回小写
              items.push({
                type: 'caps-down',
                color: 'orange',
                expected: 'CapsLock',
                hint: '按下Caps',
              });
              items.push({
                type: 'caps-up',
                color: 'orange',
                expected: 'CapsLock',
                hint: '松开Caps',
              });

              k = end;
            } else {
              // 单个大写字母（如 Windows 的 W）：自然使用 Shift 组合键
              const ch = seg.text[k];
              const cIdx = globalCharIdx++;
              const span = document.createElement('span');
              span.className = 'p-char';
              span.textContent = ch;
              charRefs[cIdx] = span;
              promptFrag.appendChild(span);

              const bKey = ch.toLowerCase();
              items.push({
                type: 'shift-down',
                color: 'blue',
                expected: 'Shift',
                hint: '按住Shift',
                isImeToggle: false,
              });
              items.push({
                type: 'char',
                display: ch,
                hint: bKey,
                shift: true,
                baseKey: bKey,
                promptCharIdx: cIdx,
                promptAction: 'direct-char',
              });
              items.push({
                type: 'shift-up',
                color: 'blue',
                expected: 'Shift',
                hint: '松开Shift',
                isImeToggle: false,
              });

              k++;
            }
          } else {
            // 普通小写字母或数字
            const ch = seg.text[k];
            const cIdx = globalCharIdx++;
            const span = document.createElement('span');
            span.className = 'p-char';
            span.textContent = ch;
            charRefs[cIdx] = span;
            promptFrag.appendChild(span);

            items.push({
              type: 'char',
              display: ch,
              hint: '',
              shift: false,
              baseKey: ch.toLowerCase(),
              promptCharIdx: cIdx,
              promptAction: 'direct-char',
            });
            k++;
          }
        }
        // 英文单词后绝不注入多余的选词空格
      } else if (seg.type === 'punct') {
        const ch = seg.char;
        const cIdx = globalCharIdx++;

        const span = document.createElement('span');
        span.className = 'p-char';
        span.textContent = ch;
        charRefs[cIdx] = span;
        promptFrag.appendChild(span);

        // 标点中英输入法状态自动推导
        const reqIme = getRequiredIme(ch);
        if (reqIme && reqIme !== simIme) {
          items.push({
            type: 'shift-down',
            color: 'blue',
            expected: 'Shift',
            hint: '按下Shift',
            isImeToggle: true,
          });
          items.push({
            type: 'shift-up',
            color: 'blue',
            expected: 'Shift',
            hint: '松开Shift',
            isImeToggle: true,
          });
          simIme = reqIme;
        }

        const info = SYMBOL_MAP[ch];
        if (info) {
          if (info.shift === true) {
            items.push({
              type: 'shift-down',
              color: 'blue',
              expected: 'Shift',
              hint: '按下Shift',
              isImeToggle: false,
            });
          }
          items.push({
            type: 'char',
            display: ch,
            hint: info.hint,
            shift: info.shift,
            baseKey: info.baseKey,
            promptCharIdx: cIdx,
            promptAction: 'direct-char',
          });
          if (info.shift === true) {
            items.push({
              type: 'shift-up',
              color: 'blue',
              expected: 'Shift',
              hint: '松开Shift',
              isImeToggle: false,
            });
          }
        } else {
          items.push({
            type: 'char',
            display: ch,
            hint: '',
            shift: false,
            baseKey: ch.toLowerCase(),
            promptCharIdx: cIdx,
            promptAction: 'direct-char',
          });
        }
      } else if (seg.type === 'space') {
        for (let k = 0; k < seg.text.length; k++) {
          const cIdx = globalCharIdx++;
          const span = document.createElement('span');
          span.className = 'p-char';
          span.textContent = '\u00A0';
          charRefs[cIdx] = span;
          promptFrag.appendChild(span);

          items.push({
            type: 'sp',
            promptCharIdx: cIdx,
            promptAction: 'direct-char',
          });
        }
      }
    }
  }

  return { promptFrag, items, charRefs, wordRefs };
}
