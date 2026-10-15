# 键盘练习：模块化工程

这是 `ai_studio_code_v2.html` 的独立工程版，保留现有 35 章、暗色界面、题型、计分、音频和输入规则。原目录中的两个 HTML 文件没有修改。该工程可以独立开发、构建和部署，不读取父目录中的旧 HTML。

采用 **Vite + TypeScript + 原生 DOM 题型组件**。构建工具负责依赖、资源和热更新；TypeScript 检查章节配置和模块接口。保留现有 DOM/CSS 可以准确迁移键盘按下/松开、逐字高亮、双行滚动等交互，不必在迁移时引入另一套渲染模型。

## 开始使用

本机已安装项目依赖。打开终端：

```powershell
cd C:\D\03-Tool\dazi\dazi-app
npm run dev
```

访问终端显示的 `http://127.0.0.1:5173`。修改 `src` 内的文件即可热更新。也可以运行本目录的 `启动开发.cmd`。

新机器需要 Node.js 22.12+（推荐 Node 22 LTS），先执行 `npm ci`。锁文件固定依赖版本。

```powershell
npm run build       # 类型检查并生成 dist
npm run preview     # 预览已构建的网站，http://127.0.0.1:4173
npm run chapters    # 查看实际启用的章节、顺序和题型
npm run check       # 类型、单元测试、格式和生产构建
```

`dist` 可以部署到普通静态网站服务，包括子目录。使用 HTTP 服务访问，开发版和构建版都不通过双击 HTML 的 `file://` 方式运行。生产运行没有后台服务要求，拼音库和发音均打包为本地资源；首次打开仍需从网站加载这些静态文件。

## 修改入口

| 想改什么                                   | 文件/目录                                                      |
| ------------------------------------------ | -------------------------------------------------------------- |
| 添加章节                                   | `src/chapters/definitions/` 新建一个定义，再加入顺序表         |
| 删除、停用、排序章节                       | `src/chapters/order.ts`                                        |
| 章节标题、题量、大小写、内容生成、空行模式 | 对应的章节定义                                                 |
| 新题型                                     | `src/features/` 新目录，章节直接绑定自己的工厂                 |
| 听音题型组合、易混字母                     | `src/features/listening/questions.ts`、`src/data/listening.ts` |
| 三轮预习流程                               | `src/features/preparation/`                                    |
| 熟练度与博学度                             | `src/domain/mastery.ts`、`src/data/rules.ts`                   |
| 网站内部大小写、输入法                     | `src/input/`                                                   |
| 拼音、分词、默认词库                       | `src/content/`                                                 |
| 发音、提示音                               | `src/audio/`、`src/assets/audio/`                              |
| 颜色、排版、题型样式                       | `src/styles/`                                                  |
| 顶部章节小条、统计栏                       | `src/ui/progress.ts`、`src/ui/hud.ts`                          |

按修改影响范围定位代码，先看 [维护地图](docs/maintenance.md)。题型私有状态、计分操作与生命周期均已隔离，添加新题型不再修改公共状态或控制器分支。

具体示例见 [章节扩展指南](docs/adding-chapters.md)，完整职责和原功能分析见 [架构说明](docs/architecture.md)。

## 验证

```powershell
npm test
npx playwright install chromium  # 仅首次安装浏览器
npm run build
npm run test:e2e
```

浏览器测试自动启动构建预览。可通过环境变量 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 使用已有 Chromium，无需写入机器专属路径。

测试包含计分边界、章节校验、听音题干扰项、中文编译、真实界面交互和新旧页面对照，以及实例隔离、任务清理、配置扩展与依赖边界。`examples/` 提供实际参与测试的新增题型和配置示例，不出现在正式课程中。`tests/fixtures/baseline.html` 仅为验证保留的旧版快照，不参与构建、不作为网站运行依赖。对照测试使用相同随机种子和相同拼音库，比较章节内容、按键序列、布局及截图。

结果和测试范围见 [迁移验证记录](docs/verification.md)。

## 保留的约定

- 顶部每个小条代表一个章节；章节 ID 固定，排序不改变成绩归属。
- 网站内部决定大小写和输入法，不读取物理 CapsLock 或系统输入法状态。
- 提示清空当前章节所有正分、保留负分；当前题不再奖励。普通听音按钮不扣分。
- 计分、负数区域、超额系数 0.25、三轮预习、整题检查时机均沿用旧版。
- 成绩和导入词库仍只保留在当前会话中；刷新重新开始。
