import { defineListeningChapter } from '../../features/listening/chapter';

export default defineListeningChapter({
  id: 'letter-listening',
  title: '字母发音与符号匹配',
  desc: '整组完成后各加1分，错配只扣当前字母1分；最终进度100%通关',
  defaultCaps: true,
});
