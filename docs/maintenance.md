# 维护地图：从需求定位影响范围

先找对应行，再读该题型的入口即可。这里的“只改配置”不需要理解控制器、其他题型状态或整个页面脚本。正式课程仍是原来的 35 章。

| 要改的内容                                 | 最先读/改的文件                                                       | 影响范围                                             | 最直接的验证                              |
| ------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| 章节标题、题目内容、题量、内部默认大小写   | 对应 `src/chapters/definitions/<id>.ts`                               | 单章；typing 的 `defaultCaps` 可配置，字母题固定大写 | `chapters.test.ts`、该章键盘操作          |
| 增加同类章节、停用、重排                   | 一个定义文件 + `chapters/order.ts`                                    | 课程目录、顶部小条和调试列表自动更新                 | `npm run chapters`、章节校验              |
| 听音的题型比例、目标字母、干扰池、易混组合 | 该章 `questions`；字段说明在 `features/listening/chapter.ts`          | 只影响传入该配置的章节                               | `listening.test.ts`、`extensions.test.ts` |
| 听音的选题算法                             | `features/listening/questions.ts`                                     | 使用听音组件的章节                                   | 听音题袋和候选项测试                      |
| 听音按钮样式/配对反馈                      | `features/listening/view.ts`、`styles/lessons.css`                    | 听音视图；共享样式需检查其他字母题                   | 听音交互、视觉对照                        |
| 填空字母范围、几个空、预习几轮             | 该章 `questions`、`preparation`；字段在 `features/cloze/chapter.ts`   | 单章                                                 | 配置扩展测试、预习/填空交互               |
| 填空完整答案如何判断、多久重试             | `features/cloze/answer.ts`（时长也可只改配置）                        | 填空题；同题重试不能开启新题奖励                     | 重复扣分、查看提示后答题                  |
| 填空按键/退格                              | `features/cloze/input.ts`                                             | 填空输入，不影响打字和预习                           | 输入未完成时不判定                        |
| 预习逐键反馈、自动下一轮                   | `features/preparation/session.ts`                                     | 复用预习的章节                                       | 三轮练习与声音测试                        |
| 单章计分参数                               | 章节的 `mastery`                                                      | 单章，顶部数字和进度自动按其规则显示                 | 计分策略隔离测试                          |
| 所有章的计分默认值/数学公式                | `data/rules.ts` / `domain/mastery.ts`                                 | 未覆盖参数的章节 / 全部熟练度章节                    | `mastery.test.ts`、通关回归               |
| 查看提示后的清分和奖励资格                 | `domain/scorebook.ts`                                                 | 全部熟练度题型                                       | 全章正分清零、负分保留、同题不加分        |
| 普通打字超时、错误、正确后的处理           | `features/typing/session.ts`；参数在本章 `timing`                     | 通用打字，保持原轮次增长时机                         | 33 章输入回归、错误和超时                 |
| 中文拼音/缩写编译                          | `features/typing/compiler.ts`、`content/pinyin.ts`、`typing/types.ts` | 中文打字                                             | 拼音、输入法、确认步骤测试                |
| 内部大小写或 IME 切换规则                  | `input/mode.ts`、`typing/input.ts`                                    | 键盘公共规则，影响范围较大                           | 物理修饰键冲突测试                        |
| 章节条和统计的视觉                         | `ui/progress.ts`、`ui/hud.ts`、`styles/progress.css`                  | 公共显示，不改变计分公式                             | 逐章截图与负进度测试                      |
| 增加全新题型                               | `exercises/contracts.ts` + `examples/tap-exercise.ts`                 | 新题型目录、新章节定义、顺序表                       | 扩展实例测试；既有题型回归                |

## 题型内部的固定阅读顺序

`chapter.ts` 定义“可以配置什么”，`driver.ts` 连接“本题型有哪些对象”，然后只进入你要修改的 `view`、`input`、`answer` 或 `session`。模型仅在该题型内流动。不需要先读 `app/controller.ts` 才能修改一个按钮或判题规则。

例如：“将一个新填空章节改成两个空、两轮预习”只需定义文件中的 `questions.gapLength: 2` 和 `preparation.rounds: 2`。题库键、评分总分、空位数量和预习门槛从同一配置派生，不再分别修改多处常量。可运行示例为 `examples/configured-chapters.ts`。

中文读音从 `content/pinyin.ts` 的 `textPinyin()` 进入：先用连续中文推导读音，再由 `features/typing/compiler.ts` 按汉字顺序映射到显示分词。全拼和缩写共用这些读音；`segment()` 只决定界面词组及确认空格，不能拿它的短词重新查音。不要将所有 `liao` 强制改成 `le`，这会破坏“了解、不了了之、受不了”。修改后运行 `tests/unit/pinyin.test.ts` 和 `tests/e2e/pinyin.spec.js`，覆盖截图长句、保留 `liao`、缩写、空行模式和实际导入输入。

## 必须理解的四个接口约定

1. `mastery.reward/penalize/revealHint` 修改计分；随后 `refresh()` 更新显示。`recordError()` 自带刷新。不要写快照中的分数。
2. `completeRound()` 会延迟推进；`restartRound()` 开始新题并恢复奖励资格；**当前题输错后的清空输入**由题型自己做。
3. `tasks.after/frame` 属于当前轮；换轮取消，离章销毁。不要把题型计时器直接挂到全局。
4. `input.letter(code)` 和 `input.accept(step)` 只使用网站内部输入状态，不从物理修饰键恢复状态。

## 防止重新耦合

特定题型不导入 `app/`、章节目录或另一题型内部；共享预习通过自己的公开工厂调用。控制器、共享 UI 和键盘模块不导入具体题型。依赖测试会拒绝违反这些边界的改动。

改公共输入、计分或生命周期时影响面本来就较大，应运行完整回归；局部配置和视图修改仍需要相应场景验证。模块隔离降低需要了解的上下文，不意味着所有修改都没有连带影响。
