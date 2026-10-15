export type TextSegment =
  | { type: 'word'; chars: string[] }
  | { type: 'english' | 'space'; text: string }
  | { type: 'punct'; char: string };
import { isHanzi } from './text';
import { isPunctChar } from '../input/keymap';

import * as pinyinPro from 'pinyin-pro';
export function pinyinProAvailable() {
  return typeof pinyinPro !== 'undefined' && typeof pinyinPro.pinyin === 'function';
}

export const FALLBACK_PINYIN: Record<string, string> = {
  你: 'ni',
  好: 'hao',
  谢: 'xie',
  早: 'zao',
  上: 'shang',
  我: 'wo',
  很: 'hen',
  明: 'ming',
  天: 'tian',
  见: 'jian',
  对: 'dui',
  不: 'bu',
  起: 'qi',
  没: 'mei',
  关: 'guan',
  系: 'xi',
  加: 'jia',
  油: 'you',
  再: 'zai',
  晚: 'wan',
  安: 'an',
  梦: 'meng',
  喜: 'xi',
  欢: 'huan',
  看: 'kan',
  书: 'shu',
  今: 'jin',
  气: 'qi',
  春: 'chun',
  来: 'lai',
  了: 'le',
  时: 'shi',
  间: 'jian',
  过: 'guo',
  得: 'de',
  快: 'kuai',
  是: 'shi',
  的: 'de',
  朋: 'peng',
  友: 'you',
  学: 'xue',
  习: 'xi',
  打: 'da',
  字: 'zi',
  有: 'you',
  趣: 'qu',
  中: 'zhong',
  国: 'guo',
  一: 'yi',
  个: 'ge',
  大: 'da',
  请: 'qing',
  问: 'wen',
  洗: 'xi',
  手: 'shou',
  在: 'zai',
  哪: 'na',
  里: 'li',
  叫: 'jiao',
  什: 'shen',
  么: 'me',
  名: 'ming',
  这: 'zhe',
  机: 'ji',
  们: 'men',
  吃: 'chi',
  饭: 'fan',
  慢: 'man',
  点: 'dian',
  说: 'shuo',
  祝: 'zhu',
  生: 'sheng',
  日: 'ri',
  乐: 'le',
  外: 'wai',
  面: 'mian',
  雨: 'yu',
  停: 'ting',
  本: 'ben',
  意: 'yi',
  把: 'ba',
  窗: 'chuang',
  户: 'hu',
  想: 'xiang',
  去: 'qu',
  公: 'gong',
  园: 'yuan',
  散: 'san',
  步: 'bu',
  他: 'ta',
  每: 'mei',
  跑: 'pao',
  下: 'xia',
  午: 'wu',
  开: 'kai',
  会: 'hui',
  周: 'zhou',
  末: 'mo',
  空: 'kong',
  吗: 'ma',
  听: 'ting',
  那: 'na',
  家: 'jia',
  店: 'dian',
  最: 'zui',
  近: 'jin',
  怎: 'zen',
  编: 'bian',
  程: 'cheng',
  冷: 'leng',
  多: 'duo',
  穿: 'chuan',
  衣: 'yi',
  别: 'bie',
  忘: 'wang',
  带: 'dai',
  伞: 'san',
  路: 'lu',
  心: 'xin',
  休: 'xiu',
  功: 'gong',
  迎: 'ying',
  光: 'guang',
  临: 'lin',
  世: 'shi',
  界: 'jie',
  北: 'bei',
  京: 'jing',
  首: 'shou',
  都: 'du',
  电: 'dian',
  脑: 'nao',
  文: 'wen',
  件: 'jian',
  台: 'tai',
  玩: 'wan',
  用: 'yong',
  档: 'dang',
  喝: 'he',
  咖: 'ka',
  啡: 'fei',
  苹: 'ping',
  果: 'guo',
  派: 'pai',
  克: 'ke',
  密: 'mi',
  码: 'ma',
};

export function charPinyin(ch: string) {
  if (!isHanzi(ch)) return ch;
  if (pinyinProAvailable()) {
    const r = pinyinPro.pinyin(ch, { toneType: 'none', type: 'array' });
    return r && r[0] ? r[0].toLowerCase() : '';
  }
  return FALLBACK_PINYIN[ch] || '?';
}

export const POLYPHONE_FIXES: Record<string, string[]> = {
  听了: ['ting', 'le'],
  看了: ['kan', 'le'],
  走了: ['zou', 'le'],
  来了: ['lai', 'le'],
  吃了: ['chi', 'le'],
  说了: ['shuo', 'le'],
  成了: ['cheng', 'le'],
  到了: ['dao', 'le'],
  好了: ['hao', 'le'],
  对了: ['dui', 'le'],
  得知: ['de', 'zhi'],
  不得不: ['bu', 'de', 'bu'],
  觉得: ['jue', 'de'],
  还好: ['hai', 'hao'],
  还是: ['hai', 'shi'],
  还有: ['hai', 'you'],
};

export function wordPinyin(word: string) {
  if (!word) return [];
  // 1. 优先命中硬规则补丁
  if (POLYPHONE_FIXES[word]) {
    return POLYPHONE_FIXES[word];
  }
  // 2. 保留传入的完整中文上下文，交给拼音库识别多音字。
  if (pinyinProAvailable()) {
    const r = pinyinPro.pinyin(word, { toneType: 'none', type: 'array' });
    if (r && r.length === word.length) {
      return r.map((s) => s.toLowerCase().replace(/[^a-zü]/g, ''));
    }
  }
  // 3. 降级时也保留每个字的位置，避免后续汉字的读音错位。
  return word.split('').map(charPinyin);
}

/** 按原文顺序返回每个汉字的读音；UI 分词不能截断发音上下文。 */
export function textPinyin(text: string): string[] {
  // 与 segment/isHanzi 支持的汉字范围一致，标点、英文和空白分隔上下文。
  return (text.match(/[\u4e00-\u9fa5]+/g) ?? []).flatMap(wordPinyin);
}

export function segment(text: string): TextSegment[] {
  const segs = [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const s = new Intl.Segmenter('zh', { granularity: 'word' });
    for (const item of s.segment(text)) {
      segs.push(item.segment);
    }
  } else {
    segs.push(...text.split(''));
  }
  const out: TextSegment[] = [];
  for (const w of segs) {
    if (/^[\u4e00-\u9fa5]+$/.test(w)) {
      out.push({ type: 'word', chars: w.split('') });
    } else if (/^[a-zA-Z0-9]+$/.test(w)) {
      out.push({ type: 'english', text: w });
    } else if (/^\s+$/.test(w)) {
      out.push({ type: 'space', text: w });
    } else if (isPunctChar(w)) {
      out.push({ type: 'punct', char: w });
    } else {
      for (const ch of w) {
        if (isHanzi(ch)) out.push({ type: 'word', chars: [ch] });
        else if (isPunctChar(ch)) out.push({ type: 'punct', char: ch });
        else if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')) {
          out.push({ type: 'english', text: ch });
        }
      }
    }
  }
  return out;
}
