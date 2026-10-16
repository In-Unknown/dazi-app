# 拼音章节音频获取与整理报告

> 生成日期：2026-10-16
> 状态：**已完成**。56 个音频已装入 `src/assets/pinyin/`，临时目录 `tmp-cmn/`、`tmp-tts/` 已清理。
> 相关代码：`src/audio/pinyin.ts`、`src/audio/assets.ts`、`src/assets/pinyin/`

## 1. 任务背景

第 22 章「单韵母」最初使用百度翻译 TTS 合成的音频（传入汉字 啊/哦/鹅/衣/乌/迂），存在三个缺陷：

1. **带介音**：衣=yi、乌=wu、迂=yu，前面多了 y/w；而单韵母 i/u/ü 是纯元音。
2. **带声调**：鹅=é、哦=ó 是二声；教学示范应用一声（阴平）。
3. **音值近似**：e 实际是 /ɤ/、o 是 /o/，用汉字逼近不精确。

目标：为拼音章节获取**标准音素发音**，并覆盖后续规划的新 22–29 章。

## 2. 音源调研结论

### 2.1 网络可达性（本机实测）

| 域名                                             | 可达性                                          |
| ------------------------------------------------ | ----------------------------------------------- |
| `api.github.com` / `raw.githubusercontent.com`   | ✅ 可达（codeload 打包 zip 超时，需逐文件下载） |
| `cdn.jsdelivr.net` / `fastly.jsdelivr.net`       | ❌ TLS 错误 / 超时                              |
| `commons.wikimedia.org` / `upload.wikimedia.org` | ❌ 超时                                         |
| 百度系、Bing、PyPI、微软语音端点                 | ✅ 可达                                         |

### 2.2 候选音源评估

| 音源                       | 内容                          | 授权        | 评价                                  |
| -------------------------- | ----------------------------- | ----------- | ------------------------------------- |
| **hugolpz/audio-cmn**      | 1707 个真人音节 + 8596 HSK 词 | CC-by-sa    | ✅ **最终采用**。真人录音，覆盖全音节 |
| shidailun/sinitic-sounds   | 237 个音素（IPA 元音/辅音）   | NOASSERTION | ⚠️ 语音学录音，有外国腔，**已弃用**   |
| vaebe/pinyin-audio         | 声母/韵母/整体认读            | ISC         | ⚠️ 音质偏 TTS 机器人感，已弃用        |
| zispace/hanyu-pinyin-audio | 多源聚合                      | 无明确授权  | ⚠️ 与 vaebe 部分同源，弃用            |
| Wikimedia Commons          | IPA 语音学录音                | CC          | ❌ 命令行不可达                       |

### 2.3 试听决策记录

- **IPA 版（sinitic-sounds）**：单韵母被用户评为「外国人腔调」，弃用。
- **Edge TTS（微软神经 TTS 读拼音）**：被用户评为「像呻吟，恶心」，弃用。
- **audio-cmn 真人**：用户确认可用，**全项目统一采用**。

## 3. 最终方案

**全部使用 hugolpz/audio-cmn 真人录音**，共 56 个文件：

| 类别      | 数量 | 说明                                                                            |
| --------- | ---- | ------------------------------------------------------------------------------- |
| 22 单韵母 | 6    | i/u/ü 用 yi/wu/yu（y/w 为隔音字母，不发音）                                     |
| 23 声母   | 21   | 用呼读音 bo/po/mo/fo、de/te/ne/le、ge/ke/he、ji/qi/xi、zhi/chi/shi/ri、zi/ci/si |
| 24 复韵母 | 13   | ai ei ao ou ia ie ua uo üe iao iou uai uei                                      |
| 25 鼻韵母 | 16   | an en in un ün ang eng ing ong ian uan üan iang uang iong ueng                  |

**关键映射规则**（拼音 → audio-cmn 文件名）：

| 拼音            | 文件名                     | 说明              |
| --------------- | -------------------------- | ----------------- |
| a/o/e           | `cmn-a1/o1/e1`             | 直接              |
| i               | `cmn-yi1`                  | 独立成音节写作 yi |
| u               | `cmn-wu1`                  | 独立成音节写作 wu |
| ü               | `cmn-yu1`                  | 独立成音节写作 yu |
| b…s             | `cmn-bo1`…`cmn-si1`        | 呼读音            |
| ia/ie/ua/uo/üe  | `cmn-ya1/ye1/wa1/wo1/yue1` | 零声母写法        |
| iao/iou/uai/uei | `cmn-yao1/you1/wai1/wei1`  | 零声母写法        |
| in/un/ün        | `cmn-yin1/wen1/yun1`       | 零声母写法        |
| ing             | `cmn-ying1`                | 零声母写法        |
| ian/uan/üan     | `cmn-yan1/wan1/yuan1`      | 零声母写法        |
| iang/uang/ueng  | `cmn-yang1/wang1/weng1`    | 零声母写法        |
| iong            | `cmn-yong1`                | 零声母写法        |

## 4. 两个特殊处理

### 4.1 iao 使用二声（yao2）

- audio-cmn 的 `cmn-yao1.mp3`（一声）**文件本身是坏的**——试听像在念「le」。
- 已在代码层面核实：`iao.mp3` 的 md5 确实对应 `cmn-yao1`，**不是映射错误**，是录音文件损坏。
- 该项目 README 提到早期版本有过 `-1` 后缀文件为副本的 bug，此文件疑为受害文件。
- **解决**：改用 `cmn-yao2.mp3`（二声），试听正常。
- 遗留：iao 目前是二声，若学习页需一声示范，需另找来源或加注说明。

### 4.2 ong 用 tong 提取版

- `ong` 在普通话里**不单独成音节**，audio-cmn 没有独立 `cmn-ong1.mp3`。
- **解决**：从 `cmn-tong1.mp3` 掐掉声母段，保留韵母段，得到 `ong.mp3`。
- 该文件为处理产物，非原始录音，质量略低于其它音节。

## 5. 文件清单（src/assets/pinyin/，56 个）

```
a.mp3  o.mp3  e.mp3  i.mp3  u.mp3  v.mp3
ao.mp3  ai.mp3  ei.mp3  ou.mp3  ia.mp3  ie.mp3  ua.mp3  uo.mp3  ve.mp3  iao.mp3  iou.mp3  uai.mp3  uei.mp3
an.mp3  en.mp3  in.mp3  un.mp3  vn.mp3  ang.mp3  eng.mp3  ing.mp3  ong.mp3  ian.mp3  uan.mp3  van.mp3  iang.mp3  uang.mp3  iong.mp3  ueng.mp3
b.mp3  p.mp3  m.mp3  f.mp3  d.mp3  t.mp3  n.mp3  l.mp3  g.mp3  k.mp3  h.mp3  j.mp3  q.mp3  x.mp3  zh.mp3  ch.mp3  sh.mp3  r.mp3  z.mp3  c.mp3  s.mp3
```

命名约定：ü → `v`（与键盘映射一致）。

## 6. 授权

- 音源：hugolpz/audio-cmn（GitHub）
- 录制者：Chen Wang（音节）、Yue Tan（HSK 词）
- 授权：**CC-by-sa**
- 来源链：SWAC Recorder 项目 → Wikimedia Commons 汉语发音
- 项目用途：非商用

## 7. 待办

1. ~~把 56 个文件装入 `src/assets/pinyin/`~~ ✅ 已完成。
2. ~~核对 `src/audio/pinyin.ts` 的映射~~ ✅ 已完成（`keyOf: ü → v`，含 üe→ve、üan→van、ün→vn）。
3. ~~跑 `npm run build` 验证~~ ✅ 已完成。
4. 后续章节（27–29）需要音节级音频时，可继续从 audio-cmn 取（覆盖 1707 音节 + 8596 HSK 词）。

## 8. 相关工具记录

- Python 环境新增：`imageio-ffmpeg`（提供 ffmpeg 二进制）、`miniaudio`、`requests`、`edge-tts`（已弃用）。
- 下载脚本、分析脚本、试听页原在 `tmp-cmn/`（临时目录），**已随本次整理清理**。
