import { defineClozeChapter } from '../../features/cloze/chapter';

export default defineClozeChapter({
  id: 'alphabet-cloze',
  title: '字母顺序完形填空',
  desc: '填完3个字母后统一检查，对本组合加1分，错扣1分；最终进度100%通关',
  defaultCaps: true,
});
