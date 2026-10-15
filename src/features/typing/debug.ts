import type { TypingModel } from './model';
export function formatTypingDebug(state: TypingModel) {
  const lines = state.typing.items
    .map((it, i) => {
      let tag: string = it.type;
      if (it.type === 'char')
        tag += `[${it.display}|hint=${it.hint || ''}|shift=${it.shift}|base=${it.baseKey}]`;
      else if (it.type.includes('shift') || it.type.includes('caps'))
        tag += `[${it.color}/${it.expected || ''}]`;
      const mark = i === state.typing.position ? '▶ ' : '  ';
      return `${mark}${String(i).padStart(3, '0')} ${tag}`;
    })
    .join('\n');
  return lines;
}
