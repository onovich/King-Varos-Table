# King Varo's Table

[English](README.md)

King Varo's Table 是一款在浏览器中运行、无需猜测的逻辑谜题。玩家将复原瓦罗王短命帝国的分裂版图：先在国界以内读懂数字，再逐步发现这场王室晚宴究竟记录了什么。

![King Varo's Table social preview](docs/social-preview.png)

## 玩法

每个数字统计以自身为中心、包含数字格本身的最多 3×3 范围内共有多少亮格。粗国界会裁剪这个范围，边界另一侧即使紧邻的格子也永远不参与计数。玩家需要把每格判断为亮或暗，逐国复原整张地图。

内置关卡册会先提供三张短教学页，再解锁 20×20 的“内海七国”正式版图。完成一个国家会推进晚宴并揭示一份亡国记录；七国全部完成后则会出现后世尾声。

## 操作

| 操作 | 控制方式 |
| --- | --- |
| 选择并使用落笔工具 | 点击 `亮格`、`暗格` 或 `擦除`；焦点在格子时，1、2、3 会选择并立即使用对应工具 |
| 使用当前工具 | 点击、轻触、Enter 或空格 |
| 连续涂色 | 使用鼠标或笔按住拖过格子；整笔只占一个撤销步骤 |
| 直接标记暗格 | 右键点击或 Shift+点击 |
| 把格子恢复为未知 | 选择 `擦除`，按 Delete/Backspace/0，或重复当前亮／暗操作 |
| 在棋盘中移动 | 方向键；Home/End 到行首尾，Ctrl/Command+Home/End 到整盘首尾 |
| 撤销或重做 | 点击 `撤销`／`重做`；或按 Ctrl/Command+Z，以及 Ctrl+Y 或 Ctrl/Command+Shift+Z |
| 请求一个必然步骤 | 点击 `给我一个必然步骤` |
| 检查或清理棋盘 | 点击 `检查当前推理` 或 `清除错误答案` |
| 切换关卡 | 打开 `关卡册` |
| 重新开始或重读故事 | 点击 `重新开局` 或地图档案按钮 |

## 语言

界面、动态提示、无障碍标签、教学文本、晚宴、亡国记录和章节尾声均支持英文与简体中文。首次访问会依据浏览器首选语言选择界面，无法匹配时回退到英文；手动选择 `中` / `EN` 后会保存在本地，且不会重置谜题进度。

## 已实现

- 四张随仓库提交的棋盘：三张循序教学页和一张七国正式版图；
- 七种手工设计的国别图案，让正式版图的答案对应当地地貌、建筑或档案物件，不再是随机纹理；
- 受国界裁剪、覆盖 0—9 的数字线索，每个区域都能只靠可见数字直接推到底；
- 由 MiniZinc 验证所有已提交区域都不存在第二解；
- 基于求解轨迹的难度档案，分别记录基础／高级推理和短／中／长工作量；
- 基于玩家当前盘面的提示、矛盾报告、区域筛选和错误答案清理；
- 适合触屏的亮格、暗格、擦除工具，以及二维键盘导航；
- 不漏格的鼠标／笔连续拖涂，并把整笔合并为一项历史；
- 同时恢复格子与国家故事状态的会话内撤销／重做，包括跨越国家完成节点的操作；
- 逐关本地存档、顺序解锁、晚宴节点、仅首次弹出的亡国记录、章节尾声和可重读档案；
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

重新生成关卡册与全部已提交棋盘：

```powershell
npm run generate
```

该命令会重写 `web/data/campaign.json` 与 `web/data/levels/*.json`；只要 MiniZinc 无法证明任一区域唯一，生成就会失败。若只需重建“内海七国”正式地图，可运行 `npm run generate:map`。

查看自动生成的整关与分区难度指标：

```powershell
npm run report:difficulty
```

## 项目文档

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

项目目前没有公开托管的在线试玩地址。更多章节、最终美术、正式平衡与专用触摸拖涂手势仍待制作。

## 授权

仓库目前没有附带开源许可证。能够查看源代码，并不表示可以复用、修改或再分发其中的代码与游戏内容。
