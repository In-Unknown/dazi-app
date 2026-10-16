import type { ExerciseContext } from '../../exercises/contracts';
import type { ListeningOptions } from './chapter';
import type { MatchQuestion } from './types';
import { stopSymbolAudio, playSymbolAudio } from '../../audio/symbol-audio';
import { playSuccessSound, playErrorSound } from '../../audio/feedback';
import { speakerIcon } from '../../ui/icons';

export function renderListening(
  context: ExerciseContext,
  options: ListeningOptions,
  question: MatchQuestion,
) {
  const { promptEl, hintEl, targetEl } = context.ui;
  const mastery = context.mastery!;
  const label = options.label ?? '字母';
  let locked = false;
  promptEl.textContent = `听发音，匹配对应的${label}`;
  promptEl.style.visibility = 'visible';
  hintEl.style.visibility = 'hidden';
  targetEl.classList.remove('scroll-mode', 'bm-mode');

  const targetLetters = question.targets;

  targetEl.innerHTML = '';
  const board = document.createElement('div');
  board.className = 'match-board';
  board.dataset.kind = question.type;
  const instruction = document.createElement('p');
  instruction.className = 'match-instruction';
  const typeLabel = { single: '单字辨音', contrast: '易混辨析', board: '多项配对' }[question.type];
  instruction.textContent = `${typeLabel} · ${question.audios.length} 段发音，${targetLetters.length} 个${label} · 先听音，再点${label}确认`;

  // 左列为音频，右列为符号；每列都使用原生按钮支持键盘操作。
  const colLeft = document.createElement('div');
  colLeft.className = 'match-col match-audios';
  colLeft.innerHTML = '<span class="match-col-label">听发音</span>';
  const colRight = document.createElement('div');
  colRight.className = 'match-col match-letters';
  colRight.innerHTML = `<span class="match-col-label">选${label}</span>`;
  let selectedAudio: HTMLButtonElement | null = null;
  let matchedCount = 0;
  const helpNote = document.createElement('p');
  helpNote.className = 'match-help-note';
  helpNote.setAttribute('role', 'status');
  helpNote.textContent = `${label}旁的试听提示会清空本章正分，保留负分`;

  const selectCard = (column: HTMLElement, card: HTMLElement | null) => {
    column.querySelectorAll('.match-card').forEach((c) => {
      c.classList.toggle('selected', c === card);
      const button = c.matches('button') ? c : c.querySelector('.match-letter-select')!;
      button.setAttribute('aria-pressed', String(c === card));
    });
  };
  const checkPair = (letterCard: HTMLElement) => {
    if (!selectedAudio) {
      helpNote.textContent = `先试听左侧发音，再点击右侧${label}确认配对`;
      return;
    }
    const audioCard = selectedAudio;
    const l = letterCard.dataset.letter;
    selectCard(colLeft, null);
    selectCard(colRight, null);
    selectedAudio = null;
    if (audioCard.dataset.letter === l) {
      stopSymbolAudio();
      playSuccessSound();
      audioCard.classList.add('matched');
      letterCard.classList.add('matched');
      audioCard.disabled = true;
      letterCard.querySelectorAll('button').forEach((button) => (button.disabled = true));
      matchedCount++;
      if (matchedCount === targetLetters.length) {
        // 仅在整组全部完成后加分，未完成的配对不提前计入熟练度。
        mastery.reward(targetLetters);
        context.refresh();
        locked = true;
        context.completeRound(options.successMs);
      }
    } else {
      playErrorSound();
      // 只扣当前被考查的音频符号，允许反复扣到该部分的下限。
      mastery.penalize(audioCard.dataset.letter!);
      context.recordError();
      audioCard.classList.add('wrong');
      letterCard.classList.add('wrong');
      context.tasks.after(options.wrongMs, () => {
        audioCard.classList.remove('wrong');
        letterCard.classList.remove('wrong');
      });
    }
  };

  question.audios.forEach((l, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'match-card';
    card.dataset.letter = l;
    card.setAttribute('aria-label', `播放第 ${index + 1} 个发音`);
    card.setAttribute('aria-pressed', 'false');
    const heights = [6, 12, 19, 13, 25, 18, 28, 20, 14, 21, 12, 8, 4];
    card.innerHTML =
      speakerIcon +
      `<span class="audio-wave" aria-hidden="true">${heights.map((height, i) => `<i style="--bar-height:${height}px;--bar-delay:${i * -45}ms"></i>`).join('')}</span>`;
    card.onclick = () => {
      if (locked || card.disabled) return;
      playSymbolAudio(options.audio, l, card);
      selectCard(colLeft, card);
      selectedAudio = card;
    };
    colLeft.appendChild(card);
  });

  targetLetters.forEach((l) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.dataset.letter = l;
    card.innerHTML = `<button type="button" class="match-letter-select" aria-label="选择${label} ${l}" aria-pressed="false">${l}</button><button type="button" class="listen-icon-btn" aria-label="试听${label} ${l}（清空本章正分，保留负分）" title="试听 ${l} · 清空本章正分，保留负分">${speakerIcon}</button>`;
    card.querySelector<HTMLButtonElement>('.match-letter-select')!.onclick = () => {
      if (locked || card.classList.contains('matched')) return;
      checkPair(card);
    };
    card.querySelector<HTMLButtonElement>('.listen-icon-btn')!.onclick = () => {
      if (locked || card.classList.contains('matched')) return;
      playSymbolAudio(options.audio, l);
      mastery.revealHint();
      context.refresh();
      helpNote.textContent = '本章正分已清空，负分保留，本组不计分';
    };
    colRight.appendChild(card);
  });

  board.appendChild(colLeft);
  board.appendChild(colRight);
  const exercise = document.createElement('div');
  exercise.className = 'match-exercise';
  exercise.append(instruction, board, helpNote);
  targetEl.appendChild(exercise);
  return;
}
