# King Varo's Table

[English](README.md)

King Varo's Table 是一款在浏览器中运行、无需猜测的逻辑谜题。玩家将复原瓦罗王短命帝国的分裂版图：先在国界以内读懂数字，再逐步发现这场王室晚宴究竟记录了什么。

[在线游戏 — 旧版](https://game.onovich.com/King-Varos-Table/)。当前工作区的连续旅程尚未发布。

![King Varo's Table social preview](docs/social-preview.png)

## 玩法

每个数字统计以自身为中心、包含数字格本身的最多 3×3 范围内共有多少亮格。粗国界会裁剪这个范围，边界另一侧即使紧邻的格子也永远不参与计数。玩家需要把每格判断为亮或暗，逐国复原整张地图。

本地入口是一张连续的 32×24 地图。48 格的佩尔岛在真实作答中教学；读完首个陷落记录后可自由选国，也可直接跳过引导。完成七国后进入晚宴终章与后世尾声。三张旧练习页和原有 20×20 地图仍可从菜单选玩，共用唯一的自动存档。标题页“新的旅程”会覆盖旧进度并重新进入可跳过的引导；“回忆往昔”直接续玩，无存档时隐藏。

## 操作

| 操作 | 控制方式 |
| --- | --- |
| 选择工具 | 点击 `亮格`、`暗格`、`擦除` 或 `移动`；1–4 只切换工具，Enter 才落笔 |
| 使用当前工具 | 点击、轻触或 Enter |
| 连续涂色 | 使用鼠标或笔按住拖过格子；整笔只占一个撤销步骤 |
| 直接标记暗格 | 右键点击或 Shift+点击 |
| 把格子恢复为未知 | 选择 `擦除`，按 Delete/Backspace/0，或重复当前亮／暗操作 |
| 在棋盘中移动 | 方向键；Home/End 到行首尾，Ctrl/Command+Home/End 到整盘首尾 |
| 撤销或重做 | 点击 `撤销`／`重做`；或按 Ctrl/Command+Z，以及 Ctrl+Y 或 Ctrl/Command+Shift+Z |
| 平移与缩放 | 空格+拖动、中键拖动或 `移动` 工具；滚轮缩放；触屏拖动／双指缩放 |
| 选择国家 | 点击全图上的国家标签；每格达到 28 CSS 像素后才可标记 |
| 请求一个必然步骤 | 点击 `提示` |
| 检查或清理棋盘 | 菜单 → `检查当前地图`，或固定的 `清除错误`，清理范围为整张已加载地图 |
| 切换关卡或重读故事 | 菜单 → `练习与旧版地图` 或 `已收录的笔记` |

## 语言

界面、动态提示、无障碍标签、教学文本、晚宴、亡国记录和章节尾声均支持英文与简体中文。首次访问会依据浏览器首选语言选择界面，无法匹配时回退到英文；手动选择 `中` / `EN` 后会保存在本地，且不会重置谜题进度。

## 已实现

- 五张本地棋盘：连续旅程、三张可选教学页，以及旧版七国地图；
- 七种手工设计的国别图案，让正式版图的答案对应当地地貌、建筑或档案物件，不再是随机纹理；
- 受国界裁剪、覆盖 0—9 的数字线索，每个区域都能只靠可见数字直接推到底；
- 由 MiniZinc 验证所有已提交区域都不存在第二解；
- 基于求解轨迹的难度档案，分别记录基础／高级推理和短／中／长工作量；
- 基于玩家当前盘面的提示、矛盾报告、区域筛选和错误答案清理；
- 适合触屏的亮格、暗格、擦除工具，以及二维键盘导航；
- 不漏格的鼠标／笔连续拖涂，并把整笔合并为一项历史；
- 同时恢复格子与国家故事状态的会话内撤销／重做，包括跨越国家完成节点的操作；
- 唯一的覆盖式本地自动存档、晚宴节点、仅首次弹出的亡国记录、章节尾声和可重读档案；
- 公开关卡 JSON 包含双语内容、地图和线索，但不包含目标答案。

## 开发

需要：

- Python 3.10+；
- Node.js 与 npm；
- 生成关卡和执行严格唯一性检查时，需要带 Gecode 求解器的 MiniZinc。

运行本地游戏：

```powershell
npm start
```

然后打开 <http://localhost:4173/>。

运行测试：

```powershell
npm test
```

重新生成旧关卡册与四张旧棋盘：

```powershell
npm run generate
```

该命令重写旧关卡文件及目录，同时保留连续旅程条目；只要 MiniZinc 无法证明任一区域唯一，生成就会失败。仅重建旧“内海七国”可运行 `npm run generate:map`；连续地图单独使用 `python tools/generate_journey.py` 生成。

查看自动生成的整关与分区难度指标：

```powershell
npm run report:difficulty
```

## 项目文档

- [连续旅程规格](docs/design/continuous-journey.md)
- [连续旅程验证记录](docs/development/continuous-journey-validation.md)
- [叙事包装规范](docs/design/narrative-packaging.md)
- [提示系统防回归规范](docs/design/hint-system.md)
- [序章与关卡册架构](docs/development/prologue-and-level-book.md)
- [关卡难度分级契约](docs/development/difficulty-grading.md)
- [第一章内容化与国别图案契约](docs/development/chapter-one-content.md)
- [触屏与键盘操作](docs/development/touch-and-keyboard-controls.md)
- [连续拖涂契约](docs/development/drag-painting.md)
- [撤销／重做历史契约](docs/development/undo-redo-history.md)
- [玩法谱系研究](research/proverbs/gameplay-lineage-2026-08-28.md)
- [仓库目录说明](docs/development/repository-layout.md)

## 状态

版本 `0.9.0` 把“内海七国”的随机答案纹理替换成七种手工设计的地图图案。每张亡国记录现在会说明刚刚复原的图像及其在征服史中的固定年代，同时关卡生成仍严格保证亮暗均衡、无需猜测的直接推理和 MiniZinc 唯一解。

线上游戏保持旧版。当前本地连续旅程为尚未发布的替换版本，已验证流程与设备限制见验证记录。更多章节、最终美术和正式平衡不在本次改动范围。

## 授权

仓库目前没有附带开源许可证。能够查看源代码，并不表示可以复用、修改或再分发其中的代码与游戏内容。
