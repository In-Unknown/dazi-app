import { describe, expect, it } from 'vitest';
import { decomposeSyllable } from '../../src/data/syllable';

describe('syllable decomposition', () => {
  it('splits regular initial + final syllables', () => {
    expect(decomposeSyllable('zhuang')).toEqual({ initial: 'zh', final: 'uang' });
    expect(decomposeSyllable('sang')).toEqual({ initial: 's', final: 'ang' });
    expect(decomposeSyllable('lu')).toEqual({ initial: 'l', final: 'u' });
    expect(decomposeSyllable('mian')).toEqual({ initial: 'm', final: 'ian' });
  });
  it('treats y/w as zero initial with canonical finals', () => {
    expect(decomposeSyllable('yao')).toEqual({ initial: '', final: 'iao' });
    expect(decomposeSyllable('you')).toEqual({ initial: '', final: 'iou' });
    expect(decomposeSyllable('yi')).toEqual({ initial: '', final: 'i' });
    expect(decomposeSyllable('wu')).toEqual({ initial: '', final: 'u' });
    expect(decomposeSyllable('wen')).toEqual({ initial: '', final: 'un' });
    expect(decomposeSyllable('yong')).toEqual({ initial: '', final: 'iong' });
  });
  it('treats bare vowel syllables as zero initial', () => {
    expect(decomposeSyllable('a')).toEqual({ initial: '', final: 'a' });
    expect(decomposeSyllable('an')).toEqual({ initial: '', final: 'an' });
    expect(decomposeSyllable('ou')).toEqual({ initial: '', final: 'ou' });
  });
  it('restores ü after j/q/x and expands iu/ui', () => {
    expect(decomposeSyllable('ju')).toEqual({ initial: 'j', final: 'ü' });
    expect(decomposeSyllable('xue')).toEqual({ initial: 'x', final: 'üe' });
    expect(decomposeSyllable('xuan')).toEqual({ initial: 'x', final: 'üan' });
    expect(decomposeSyllable('jun')).toEqual({ initial: 'j', final: 'ün' });
    expect(decomposeSyllable('jiu')).toEqual({ initial: 'j', final: 'iou' });
    expect(decomposeSyllable('gui')).toEqual({ initial: 'g', final: 'uei' });
  });
  it('returns null for unsupported syllables', () => {
    expect(decomposeSyllable('er')).toBeNull();
  });
});
