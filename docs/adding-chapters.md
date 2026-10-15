# 添加和修改章节

新增既有题型只需要一个定义文件和顺序表入口。定义使用对应题型的 builder；不同题型没有共用一个包含大量无关字段的大配置对象。

## 普通打字

新建 `src/chapters/definitions/four-digits.ts`：

```ts
import { defineTypingChapter } from '../../features/typing/chapter';
import { randInt } from '../../core/random';

export default defineTypingChapter({
  id: 'four-digits',
  title: '四位数字',
  desc: '按顺序输入四位数字',
  compiler: 'sequence',
  rounds: 20,
  gen: () => ({ text: String(randInt(1000, 9999)) }),
});
```

在 `src/chapters/order.ts` 加入 `'four-digits'`，即自动进入课程、顶部进度和调试列表。运行 `npm run chapters` 查看。

固定文本可用 `gen: () => ({ text: '1234' })`；完整列表用 `buildList: () => [...]`。列表短于规定题量时循环取题；同时提供时优先 `buildList`。`rounds` 默认 15，`defaultCaps` 默认关闭，`isBlankLineMode` 控制双行撰写。

中文内容用 `compiler: 'prompt'`、`gen: () => ({ prompt: '你好，今天也要练习。' })`。`mode` 可选 `full`、`abbrev`、`mixed-abbrev`、`mixed`、`multiline`；单题 `mode` 优先于章节值。与章节位置无关。

`timing` 可单独覆盖 `baseMs`、`perStepMs`、`successMs`、`retryMs`，默认分别为 1800、1100、480、1000。倒计时为 `(baseMs + 步骤数 × perStepMs) × 难度倍率`。

## 听音

```ts
import { defineListeningChapter } from '../../features/listening/chapter';

export default defineListeningChapter({
  id: 'sx-listening',
  title: 'S / X 辨音',
  desc: '辨认目标字母，保留干扰音',
  questions: {
    symbols: ['S', 'X'],
    audioPool: ['S', 'X', 'H', 'N'],
    confusable: ['SX', 'HN'],
    mix: ['contrast', 'single'],
  },
  mastery: { standard: 4, reward: 2 },
  preparation: false,
});
```

默认仍是完整 A–Z、`board/single/contrast/single/contrast` 随机题袋、多项 5 个目标配 7 个音频，其余 4 个音频加难度额外最多 2 个。可覆盖 `boardTargets`、`boardAudios`、`choiceAudios`、`maxTierExtraAudios`、`successMs`、`wrongMs`。候选音频不重复；池不足时数量受池大小限制，但必须留有干扰项。

`symbols` 定义计分和通关所需的目标；`audioPool` 可包含其他干扰字母。错配仍扣选中的音频字母，外部干扰字母的扣分会被记录，但不纳入目标集合的总分或通关。正式 A–Z 课程的两者集合相同，维持原来的扣分效果。若新练习需要另一种扣分归属，应明确新增规则，不能靠改变文字说明实现。

预习默认开启并展示目标字母；`preparation: { symbols: [...] }` 可以指定另一个发音表，`false` 跳过预习。现有录音范围是 A–Z，不支持在配置中填写任意单词。

## 顺序填空

```ts
import { defineClozeChapter } from '../../features/cloze/chapter';

export default defineClozeChapter({
  id: 'short-sequence',
  title: '短序列填空',
  desc: '完整输入两个空位后判断',
  questions: { symbols: ['A', 'B', 'C', 'D'], gapLength: 2, contextLength: 1 },
  preparation: { rounds: 2, nextRoundMs: 450 },
});
```

这个定义自动得到 AB、BC、CD 三个计分部分、两个空位、两轮预习。正式课程仍是 26 个字母、三个空位、两侧最多两个上下文字母、三轮预习，正确延迟 650ms、错误重试 1000ms。反馈时长可用 `questions.successMs/retryMs` 覆盖。

字母范围必须是不重复的 A–Z 大写字符，顺序以配置为准；听音和填空固定以网站内部大写状态输入。不要为字母题设置物理键盘状态。

## 熟练度参数

听音与填空定义均可选 `mastery`：`standard` 默认 2、`minimumMultiplier` 默认 3、`alpha` 默认 0.25、`reward` 与 `penalty` 默认 1。未覆盖的字段沿用默认值。每章的总分、最低分和初始零点由该章参数计算，不需要另改 HUD 或进度条。

通关依旧只依据原始最终值满分。提示对当前章每个分数取 min(当前值, 0)，清空正分并保留负分并禁止当前题奖励；未达标部分不能由别处超额分数抵消。调整数学公式在 `domain/mastery.ts`，只调参数不需要改公式。

## 新增题型

先读 `src/exercises/contracts.ts`。实现一个 `create(context)`，返回 `startRound` 和可选 `keyDown/keyUp/isPreparing/dispose`；本题型的状态放在工厂内部。用 `defineChapter` 绑定工厂并指定轮数或熟练度策略，再添加章节定义与顺序入口。

可运行的完整第四题型是 `examples/tap-exercise.ts`。测试将它和真实听音章节组合成课程，验证正常推进及离章取消；未修改公共控制器、中央类型枚举、键盘分支或共享状态。示例目录不被正式课程扫描。

共享接口不是万能题型语言。需要新通关算法、新公共布局或新资源类型时，应明确扩展相应接口并测试；同类题型内部的变化应留在自己的目录。

## 停用、重排与验证

- 从 `order.ts` 删除 ID 即停用；移动 ID 即重排。定义可留作模板。
- 永久删除同时移除定义与顺序入口。重复 ID、未知 ID、空课程和无效参数会报错。
- ID 决定成绩归属，标题和位置可以自由调整。
- `npm run check` 检查类型、参数与单元回归；`npm run test:e2e` 验证交互和视觉。
- 新需求真正改变了内容或行为后，应明确更新对应验收。当前对照用例和 `chapter-inventory.json` 有意固定原 35 章，用于保证本次结构重构没有改变产品；不要通过放宽它们的断言掩盖迁移回归。

更多定位入口见 [维护地图](maintenance.md)。
