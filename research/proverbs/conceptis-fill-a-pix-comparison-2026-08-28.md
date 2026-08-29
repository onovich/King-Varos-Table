# Conceptis Fill-a-Pix 与当前项目玩法对照

- 调研日期：2026-08-28
- 调研范围：核对 Conceptis Fill-a-Pix 的官方规则、解题技巧、产品形态和数字版功能，并与 `LearnProverbs` 当前公开关卡、生成器、求解器和网页交互逐项比较。
- 当时的项目基线：`web/data/demo-level.json`，20×20、四区域、seed `20260828`。该文件后来由关卡册架构取代；当前正式地图位于 `web/data/levels/inner-sea.json`，本报告的量化结果仍保留为历史快照。

## 证据标记

- **【官方明确说明】**：Conceptis 官方网页、Conceptis 署名文章、Conceptis 发布的规则 PDF，或由 Conceptis 作为开发者维护的应用商店说明直接写明。
- **【合理推断】**：由官方规则直接推导出的数学结论，或为了工程比较而做的形式化表达；不是官方原话。
- **【尚未证实】**：本轮查阅的一手资料没有给出足够信息，不能当作产品承诺。

## 先给主线的结论摘要

1. **【官方明确说明】** 标准 Fill-a-Pix 的一个数字约束的是“以数字格为中心、经棋盘外边缘裁剪后的最多 3×3 范围”，并且**包含数字格自身**。棋盘外的格子不参与计数。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
2. **【官方明确说明】** 数字体系源自 0–9；位于内部时理论范围为 0–9。官方教程明确把内部的 9、边缘的 6、角落的 4 作为“范围内所有格均填色”的起手线索。来源：[Trevor Truran 的 Conceptis 署名文章](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
3. **【官方明确说明】** Basic Logic 只需逐个分析单一线索；Advanced Logic 需要同时分析两个线索及其重叠范围。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
4. **【官方明确说明】** Conceptis 同时宣称每题唯一解、始终有下一步、不得猜测，并称谜题可仅凭逻辑完成。来源：[官方提示](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/tips)、[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)。
5. **【官方明确说明】** 当前常规产品形态是 Basic、Advanced 与 Mega；Mega 沿用同一规则，只是棋盘更大，而且可采用 Basic 或 Advanced 逻辑。移动版标明最大尺寸为 65×100。来源：[官方 Fill-a-Pix 页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)、[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
6. **【官方明确说明】** 标准产品是黑白像素画；移动版称谜题由艺术家手工创作。**【尚未证实】** 官方没有要求线索布局或最终图片必须对称，也没有公布每题黑白面积的硬性比例。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
7. **【官方明确说明】** 数字版的 Smart-fill 是围绕一个线索批量处理剩余格的操作工具；Puzzle Assistant / Hint 才用于查错或寻找下一步。**【尚未证实】** 官方资料没有公开提示求解器、证明格式或提示是否总能精确到一个必然格。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)、[App Store 官方应用说明](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad)。
8. **【本地实现确认】** 当前项目的核心方程与 Fill-a-Pix 一致，但额外加入“只统计同一区域”的裁剪；默认公开玩法正好对应 Conceptis Basic，而内部未启用的双线索差集能力接近 Conceptis Advanced。
9. **【本地关卡量化】** 当前演示关卡不是不规则四区，而是四个完整的 10×10 矩形。116 条可见线索中有 51 条开局即可直接结算，覆盖 272/400 个不同格子；因此它目前更接近“并排放置的四张入门 Fill-a-Pix”，而非成熟的不规则巨幅版本。
10. **【最大体验差异】** Conceptis 的二值答案本身就是最终黑白像素画；当前项目的二值答案是程序生成的平滑随机场，尚未接入最终画作或区域完成后的图像揭示。规则闭环已完成，但 Fill-a-Pix 最核心的“解题即作画”回报尚未复现。

## 1. 标准规则

### 1.1 棋盘、格子状态与目标

- **【官方明确说明】** 谜题是一个矩形网格，部分格子内放有数字线索。玩家要把每个格子最终判定为“填色”或“留空”，从而显露隐藏的像素画。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)。
- **【官方明确说明】** 标准 Fill-a-Pix 是黑白题。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)。
- **【官方明确说明】** 完成数字版谜题时，所有格子都必须被明确标成填色或留空，而且状态符合规则。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)。

### 1.2 数字到底数哪些格

- **【官方明确说明】** 一个线索表示：以线索格为中心的最多九格中，需要填色的格数；九格包括线索格自身和周围八格。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
- **【官方明确说明】** 角落线索只有自身加三个邻格，共四格；边缘线索只有自身加五个邻格，共六格。官方技巧页分别用角落 4 和边缘 5 的六格范围示范。来源：[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
- **【合理推断】** 因此棋盘外部不是“默认暗格”或“参与计数的虚拟格”，而是直接不属于该线索的变量集合。可以形式化为：`N(c) = 棋盘内格子 ∩ 以 c 为中心的 3×3`。
- **【官方明确说明】** 数字格自身也可能被填色或留空；它不是天然固定为某一种状态。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)。

### 1.3 数字范围

- **【官方明确说明】** Trevor Truran 在 Conceptis 刊载的署名文章中明确写到这一体系使用 0–9，每个数字表示自身及邻格中被占用的数量。来源：[The Path to Fill-a-Pix](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156)。
- **【合理推断】** 内部线索的合法值为 0–9，非角边缘线索为 0–6，角落线索为 0–4。这不是三套不同规则，而是同一约束经过边缘裁剪后的自然上限。
- **【官方明确说明】** 官方把内部 0/9、边缘 6、角落 4列为最直接的起手线索；0 表示范围内全留空，上限值表示范围内全填色。来源：[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)、[官方提示](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/tips)。

## 2. 玩家操作

### 2.1 纸面玩法

- **【官方明确说明】** 对确认填色的格子进行涂黑；对确认留空的格子画 `X`。官方建议轻涂，以免覆盖格内数字。来源：[官方提示](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/tips)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。

### 2.2 Conceptis 网页交互器

> 该页面是 Conceptis 的官方交互说明，但页面形态可能早于当前移动应用；以下只记录其明示语义，不假定所有界面细节仍与 2026 年移动版相同。

- **【官方明确说明】** 单击同一格依次循环为：填色 → `X`（留空）→ 初始未判定；也可拖动批量操作。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)。
- **【官方明确说明】** Smart-fill 光标框住一个线索后，可一次性把该线索范围内尚未处理的格子全部填色或全部标空；Delete 可清除该九格范围内的玩家状态。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)。
- **【合理推断】** Smart-fill 是在玩家已经满足“剩余格全同态”的前提下加速录入，不等同于向玩家证明该前提，也不等同于 Hint。
- **【官方明确说明】** 一个线索周围所有格都完成标记后，线索会变灰并可播放声音。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)。
- **【官方明确说明】** 工具栏包含缩放、无限步撤销/重做、重新开始、Puzzle Assistant、进度预览和计时、显示答案、偏好设置、打印与保存。Puzzle Assistant 的页面说明是“检查错误或取得下一步提示”；显示答案会结束本局。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)。
- **【官方明确说明】** 偏好设置包括自动填起手线索、实时显示错误、声音，以及 Smart-fill 光标模式。自动起手覆盖内部 9、边缘 6、角落 4 和任意位置的 0。来源：[官方交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)。

### 2.3 当前移动应用公开功能

- **【官方明确说明】** 移动版使用“指尖光标”：先移动光标选格，再在屏幕任意位置点击；长按并拖动可连续处理相邻格。来源：[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)、[App Store 官方应用说明](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad)。
- **【官方明确说明】** 移动版提供 Smart-fill、游戏中显示错误、无限次检查、无限提示、无限撤销/重做、自动填起手线索、缩放/缩小/平移、计时。来源：[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
- **【官方明确说明】** 还包括谜题进度缩略图和 Gallery、同时保存多局、筛选/排序/归档、深色模式；Android 使用 Google Drive 备份，iOS 使用 iCloud 备份。来源：[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)、[App Store 官方应用说明](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad)。
- **【官方明确说明】** Conceptis 曾在 App Store 的开发者回复中说明：Assistant 能识别错误并允许自动修复；若没有错误但仍未完成，会移动棋盘并框出可以进行下一步的区域。来源：[App Store 官方应用页中的开发者回复](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad)。
- **【尚未证实】** 应用商店和官方交互说明均未公开 Hint 的约束求解算法、逻辑层级、证明文本格式，也未明确承诺每次提示只指向一个格子或完整揭示一个线索的有效范围。

## 3. Basic Logic 与 Advanced Logic

### 3.1 Basic Logic：单线索直接结算

- **【官方明确说明】** Basic Logic 的定义是一次只分析一个线索。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
- **【官方明确说明】** 官方教程展示的基本模式包括：
  1. 线索范围已填色数已经达到线索值，则其余未判定格全部留空；
  2. 线索范围中“已填色数 + 未判定数”等于线索值，则其余未判定格全部填色；
  3. 内部 0/9、边缘 6、角落 4 是第二类规则的直接起手情形。
  来源：[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
- **【合理推断】** 可把 Basic 统一形式化。令线索值为 `k`，其有效范围中已填色数为 `F`、未判定数为 `U`：
  - `F = k` ⇒ `U` 中全部留空；
  - `F + U = k` ⇒ `U` 中全部填色。
  这是对官方示例的代数化，不是 Conceptis 发布的术语。

### 3.2 Advanced Logic：两个线索的重叠/差分

- **【官方明确说明】** Advanced Logic 的定义是两个线索同时影响彼此及周围格子，需要联合分析。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[官方技巧](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
- **【官方明确说明】** 官方步骤示例先利用角落线索 3 的四格范围，再结合附近线索 5 已经共享的三个填色格，推出 5 的范围中另外两个非共享格必须填色。来源：[官方技巧，第 4 步](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques)。
- **【合理推断】** 工程上可以把该技巧称为“两个邻域约束的包含、重叠与差分推理”：比较两个有效范围的交集和各自独占部分，利用两个剩余计数推出某些独占格全亮或全暗。Conceptis 页面没有给出这个正式名称。
- **【尚未证实】** 官方公开教程没有提供 Advanced 的完备规则清单、难度评分公式或形式证明，也没有明确说明是否存在需要三个以上线索联合推理的官方题；它只明确把两线索互动作为 Advanced 的特征。

## 4. 唯一解与“无需猜测”承诺

- **【官方明确说明】** 官方提示页写明每题只有一个唯一解。移动版应用说明也重复“每题唯一解”。来源：[官方提示](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/tips)、[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
- **【官方明确说明】** 官方要求不要猜，只在确信格子必填或必空时操作，并称盘面上始终还存在下一步；规则页称谜题使用纯逻辑完成。来源：[官方提示](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/tips)、[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)。
- **【合理推断】** “唯一解”和“无需猜测”是两个不同性质：前者是全局解数量，后者还要求存在符合官方解题逻辑的递进路径。Conceptis 分别做出了这两项产品层面的明确声明。
- **【尚未证实】** Conceptis 没有在上述公开资料中给出可审计的生成算法、求解器源码、每题证明证书，或“无需猜测”所依赖技巧集合的形式化完备定义。因此可以把它视为官方质量承诺，但不能据此复现其内部验证流程。

## 5. 题型、尺寸、难度、对称与图片

### 5.1 当前主线题型

- **【官方明确说明】** 官方 Fill-a-Pix 主页面列出三类产品：Basic Logic、Advanced Logic、Mega。来源：[官方 Fill-a-Pix 页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)。
- **【官方明确说明】** Mega 使用与普通题相同的邻域计数规则；官方示例同时存在 “with Basic Logic” 和 “with Advanced Logic”，所以 Mega 是尺寸/版面类别，不是第三套推理规则。来源：[官方 Fill-a-Pix 页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)。
- **【官方明确说明】** 官方网页当前展示的普通周更样例覆盖 10×10、15×15、20×20、25×25、30×30、35×35；Mega 样例为 100×65。移动应用说明给出的最大尺寸为 65×100。来源：[官方 Fill-a-Pix 页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)、[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
- **【官方明确说明】** 难度不是只由 Basic/Advanced 或尺寸决定。官方列表在不同类型和尺寸下使用 Ultra easy、Very easy、Easy、Medium、Medium plus、Very hard 等等级。来源：[官方 Fill-a-Pix 页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)。

### 5.2 图片与线索布置

- **【官方明确说明】** 标准题完成后显露黑白像素画；移动版说明称谜题由艺术家手工创作。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
- **【官方明确说明】** 当前规则只要求数字散布在网格的若干位置，并不要求每格都有数字。Truran 的历史文章说明，早期“每格一个数字”或“隔格一个数字”的原型存在冗余，后来目标是用较少信息形成可解图片。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[The Path to Fill-a-Pix](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156)。
- **【官方明确说明，但不是硬性指标】** Conceptis 在 Google Play 的开发者回复中曾用“大约一半格子为黑或白”解释深色模式的视觉效果。这可视为对产品常见图片密度的概括，不能视为每题必须接近 50:50 的生成约束。来源：[Google Play 官方应用页中的开发者回复](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
- **【尚未证实】** 未找到每题最少/最多线索密度、黑白面积比例、连通性、图片清晰度评分或题面美学约束的公开规范。

### 5.3 对称和版面拓扑

- **【官方明确说明】** 标准 Fill-a-Pix 规则描述的是一个矩形网格和它的外边缘，没有大区块、内部洞、区域边界或旋转对称约束。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)。
- **【官方明确说明】** Conceptis 将旋转对称作为另一个独立题种 Sym-a-Pix 的核心规则，而不是 Fill-a-Pix 的规则。来源：[Sym-a-Pix 官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/sym-a-pix/rules)。
- **【尚未证实】** 未找到 Fill-a-Pix 的线索布局必须轴对称/中心对称，或最终像素画必须对称的官方要求。个别题目的视觉对称只能视为画面内容，不是玩法约束。

## 6. 官方变体与相关名称

### 6.1 Basic、Advanced、Mega

- **【官方明确说明】** Basic 与 Advanced 的差异在所需推理方式；Mega 的差异在尺寸，且可搭配 Basic 或 Advanced。来源：[官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)、[官方 Fill-a-Pix 页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)。

### 6.2 Colour Fill-a-Pix

- **【官方明确说明】** Conceptis 发布过《Colour Fill-a-Pix》官方 PDF：每个彩色数字表示其 3×3 范围内应涂成“数字颜色”的格数；数字所在格最终颜色可以与数字颜色不同。来源：[Conceptis Colour Fill-a-Pix PDF](https://www.conceptispuzzles.com/resource/1/183.pdf)。
- **【尚未证实】** 当前 Fill-a-Pix 主页面和移动应用说明没有把 Colour Fill-a-Pix 列为常规在售类型；本轮只能确认它是 Conceptis 官方记录过的变体，不能确认 2026 年仍持续发布。

### 6.3 名称不是规则变体

- **【官方明确说明】** 移动版把 Mosaic、Mosaik、Fill-In、Nurie-Puzzle、Japanese Puzzle 列为 Fill-a-Pix 在不同市场使用的其他名称。来源：[Google Play 官方应用说明](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)。
- **【合理推断】** 这些名称本身不表示玩法不同；若要判断某个同名产品是否改过规则，仍需检查该产品自己的规则说明。

## 7. 数字版辅助功能清单

| 功能 | Conceptis 明示行为 | 证据状态 | 来源 |
|---|---|---|---|
| 格子输入 | 填色、标 `X`、恢复未判定；支持拖动批量输入 | 官方明确说明 | [交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive) |
| Smart-fill | 对一个线索周围剩余未判定格批量填色或标空 | 官方明确说明 | [交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive) |
| Assistant / Check | 查错；网页说明也可取得下一步提示 | 官方明确说明 | [交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive) |
| 移动版 Hint | 无限次提示 | 官方明确说明；提示算法未证实 | [Google Play](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap) |
| 移动版 Assistant 定位 | 无错误时移动盘面并框出可进行下一步的区域 | 官方开发者回复；精确提示粒度未证实 | [App Store](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad) |
| 错误处理 | 可实时显示错误、无限检查；开发者回复称可自动修复检测到的错误 | 官方明确说明 | [Google Play](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)、[App Store](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad) |
| 撤销/重做 | 无限撤销与重做 | 官方明确说明 | [Google Play](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap) |
| 自动起手 | 自动处理内部 9、边缘 6、角落 4、任意 0 | 官方明确说明 | [交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive) |
| 进度与计时 | 进度预览、缩略图/Gallery、解题时间 | 官方明确说明 | [交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive)、[Google Play](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap) |
| 大盘操作 | 缩放、平移、指尖光标 | 官方明确说明 | [Google Play](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap) |
| 保存与整理 | 多局并行保存、筛选/排序/归档、云备份 | 官方明确说明 | [Google Play](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap)、[App Store](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad) |
| 显示答案 | 可直接显示答案，但会结束本局 | 官方明确说明（网页交互器） | [交互说明](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive) |

## 8. 与当前 `LearnProverbs` 的逐项对照

本节以代码和当前公开 JSON 为准，不把 README 中尚未完成的目标当作现状。关键实现位置包括：

- 邻域与区域裁剪：`varos_table/level.py:120-149`、`web/puzzle-logic.mjs:9-22`
- 目标答案生成：`varos_table/level.py:186-210`
- 线索删减与基础无猜验收：`varos_table/level.py:213-242`
- 唯一性验证入口：`varos_table/level.py:289-297`、`models/region_unique.mzn`
- 玩家提示：`web/puzzle-logic.mjs:25-98`、`web/app.js:312-360`
- 错误清理：`web/puzzle-logic.mjs:395-411`、`web/app.js:385-411`

| 对照维度 | Conceptis Fill-a-Pix | 当前项目 | 判断与影响 |
|---|---|---|---|
| 数字是否包含自身 | 是 | 是 | **完全一致。** 两者都把数字格作为二值未知量计入自身 3×3。 |
| 数字范围 | 体系为 0–9；局部上限受外边缘裁剪 | 体系为 0–9；当前关卡还强制公开线索整体覆盖 0 和 9 | **规则一致，生产约束更强。** Conceptis 没有公开要求每题必须展示全套 0–9。 |
| 棋盘外边缘 | 内部/边缘/角落最多 9/6/4 格 | 同样裁掉棋盘外格 | **一致。** |
| 内部区域边界 | 标准题没有区域；整张矩形盘连续计数 | 线索额外与 `regionMap` 求交，跨色块格完全不计 | **核心变体。** 相同位置的数字可能因区域形状而拥有不同变量集合。 |
| 当前区域形状 | 不适用 | 当前 JSON 实际是四个 10×10 矩形，不是不规则区 | **当前完成度缺口。** 现状等价于四张独立小题拼成一页；尚未体现设计文档所说的不规则边界玩法。 |
| 玩家格子状态 | 填色 / 留空 `X` / 未判定 | 亮 / 暗 / 未知；只用底色区分，不显示符号 | **逻辑等价、视觉不同。** 当前表现遵循项目已确定的“不要让符号压住数字”要求。 |
| Basic | 一次分析一个数字；余量为 0 或等于未知格数时直接结算 | `DirectClueSolver` 与网页默认提示只执行同样两条规则 | **高度一致。** 当前公开关卡可以明确标为 Fill-a-Pix Basic 类。 |
| Advanced | 两条线索联合分析其重叠和独占部分 | `NoGuessSolver`/JS 分析器具有子集差分，但公开关卡和默认提示禁用 | **能力已做、产品层尚未开放。** 数学思想与 Conceptis Advanced 同源，但并非完整复刻其全部可能技巧。 |
| 无需猜测 | 官方明确承诺始终存在逻辑步骤 | 生成时要求每一区域能被 `DirectClueSolver` 从空盘完整解出 | **一致且本地更可审计。** 当前默认题甚至只要求 Basic 即可走完。 |
| 唯一解 | 官方明确承诺，但未公开验证器 | 每一区域用 MiniZinc 阻塞目标答案，检查不存在第二解 | **目标一致，当前工程证据更强。** |
| 解题图片 | 最终黑白格本身组成艺术家制作的像素画 | 每区先生成精确 50:50 的平滑随机二值场；页面没有最终画作揭示层 | **最大体验差异。** 当前只有逻辑图案，没有“解出一幅画”的内容回报。 |
| 亮暗比例 | 官方未公布硬性比例 | 当前每个 100 格区域固定 50 亮、50 暗 | **本地特有约束。** 有利于均衡视觉，但可能限制图像内容和线索分布。 |
| 线索删减 | 官方公开规则未给出算法；产品称由艺术家手工制作 | 从全线索开始随机贪心删除，每次删除后重跑 Basic solver | **当前高度程序化。** 能保证规则链，却未具备人工图像与难度修整。 |
| 尺寸与内容量 | 常规多尺寸；移动版最大 65×100，另有 Mega | 当前仅一张 20×20、400 格演示题 | **功能原型规模。** 还没有题库、巨幅滚动或持续内容。 |
| 提示 | Assistant 可查错或框出下一步区域；精确算法未公开 | 明确强高亮一个可直接结算的数字，弱高亮其完整有效范围，不代替玩家落子 | **当前提示合同更严格、更可解释。** 不能声称视觉行为完全复刻 Conceptis，但符合 Basic 规则。 |
| Smart-fill | 是录入加速器，可一次处理线索周围剩余格；不等于 Hint | 没有 Smart-fill；玩家需逐格点击 | **缺少大盘效率工具。** 若将来添加，应与提示分开命名。 |
| 错误处理 | 实时显示错误、检查、Assistant 修复 | “检查”检测数字约束矛盾；“清除错误答案”删除所有与重建答案不符的标记 | **当前清错很直接。** 但“检查通过”只表示尚无局部矛盾，不等于所有已填格都正确。 |
| 常用数字工具 | 缩放、平移、撤销/重做、自动起手、计时、保存、Gallery 等 | 目前只有提示、检查、清错、重开和区域筛选 | **大盘可用性明显不足。** 20×20 尚可，扩大棋盘后会迅速成为瓶颈。 |
| 颜色 | 标准题为黑白；另有规则不同的 Colour Fill-a-Pix | 色彩表示区域身份和亮暗状态，数字本身没有颜色语义 | **不是 Colour Fill-a-Pix。** 当前仍是二值题，只是 UI 使用多套底色。 |

### 8.1 当前演示关卡的量化结果

对当时的 `web/data/demo-level.json` 直接统计得到：

| 指标 | 当前值 |
|---|---:|
| 棋盘 | 20×20，共 400 格 |
| 区域 | 4 个，每区恰好 100 格 |
| 实际区域形状 | 四个 10×10 矩形，按 2×2 排列 |
| 可见线索 | 116 条，密度 29% |
| 各区线索数 | 32 / 26 / 28 / 30 |
| 线索值 0–9 的数量 | 23 / 11 / 7 / 11 / 15 / 8 / 13 / 6 / 7 / 15 |
| 有效范围大小 | 4 格范围 16 个、6 格范围 128 个、9 格范围 256 个 |
| 开局直接线索 | 51 条，即值为 0 或等于范围大小的线索 |
| 开局可直接确定的不同格 | 272 格，占全盘 68% |
| 每区亮暗 | 50 / 50 |
| 数学唯一 | 四区均由 MiniZinc 验证 |
| 默认推理等级 | 全部为 Basic；不需要双线索差分 |

这里最值得注意的是，当前 51 条开局直接线索覆盖了 68% 的棋盘。它不代表所有 Conceptis Basic 都更难，但足以说明**当前这一张演示题的推理非常前置、起手极其充足**。四块矩形又把单张 20×20 应有的 4 个角扩展成 16 个“区域角”，进一步增加了容易直接结算的边缘机会。

### 8.2 当前项目究竟属于哪一类

从纯规则分类看，当前项目可以准确表述为：

> **四张自封闭矩形 Fill-a-Pix Basic 拼成的区域化页面，并额外提供 MiniZinc 唯一性证明。**

它已经不是标准 Fill-a-Pix，因为区域边界参与计数；但它也还没有兑现设计目标中的“不规则巨幅画布”，因为当前 `regionMap` 退化成了四个矩形，且没有最终画作揭示。

### 8.3 对后续实现最有价值的结论

1. **不需要再改核心计数公式。** 包含中心、0–9、边缘裁剪和亮/暗二值均已正确。
2. **若目标是贴近 Conceptis Basic，当前默认 solver 和提示合同已经合适。** 不要让基础关卡暗中依赖双线索差分。
3. **若目标是继续复刻《Proverbs》，下一优先级应是真正的不规则 `regionMap` 和区域完成后的画作揭示。** 这两项比继续增加线索数字或证明文字更能改变体验。
4. **应正式建立 Basic / Advanced 难度层。** Advanced 可以从现有子集差分能力起步，但必须先设计玩家看得懂的双线索高亮与说明；Conceptis 的分类为这一区分提供了直接依据。
5. **扩大棋盘前应补撤销/重做、缩放/平移和 Smart-fill。** Smart-fill 只能作为玩家确认推理后的批量录入工具，不能冒充 Hint。
6. **应降低演示题的起手覆盖率并记录难度指标。** 当前 68% 格子开局可直接判定，更适合教学盘；正式关卡应至少记录开局直接线索数、开局覆盖格数、传播轮数和高级步骤占比。

## 9. 来源表

| 编号 | 一手来源 | 来源性质 | 本报告主要使用内容 |
|---|---|---|---|
| S1 | [Conceptis：Fill-a-Pix rules](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules) | Conceptis 官方规则 | 包含自身、最多 3×3、黑白像素画、Basic/Advanced 总定义、纯逻辑 |
| S2 | [Conceptis：Fill-a-Pix techniques](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/techniques) | Conceptis 官方逐步教程 | 角落/边缘裁剪、Basic 两种直接结算、Advanced 双线索示例 |
| S3 | [Conceptis：Fill-a-Pix tips](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/tips) | Conceptis 官方提示 | 不猜、始终有下一步、每题唯一解、纸面标记方式 |
| S4 | [Conceptis：Fill-a-Pix Interactive](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/interactive) | Conceptis 官方网页交互说明 | 输入循环、Smart-fill、Assistant、完成判定、工具栏与偏好 |
| S5 | [Conceptis：Fill-a-Pix 主页面](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix) | Conceptis 官方目录 | Basic/Advanced/Mega、样例尺寸与难度 |
| S6 | [Trevor Truran：The Path to Fill-a-Pix](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156) | 发明者在 Conceptis 发布的署名文章 | 0–9 起源、邻域定义、早期线索冗余与唯一性问题 |
| S7 | [Google Play：Fill-a-Pix（Conceptis Ltd.）](https://play.google.com/store/apps/details?hl=en&id=com.conceptispuzzles.fap) | 开发者维护的当前产品说明 | 最大尺寸、唯一解、艺术家创作、移动操作与辅助功能 |
| S8 | [Apple App Store：Fill-a-Pix（Conceptis Ltd.）](https://apps.apple.com/us/app/fill-a-pix-minesweeper-puzzle/id479420052?platform=ipad) | 开发者维护的当前产品说明及开发者回复 | iOS 功能、Assistant 的查错/定位行为、iCloud 备份 |
| S9 | [Conceptis Colour Fill-a-Pix PDF](https://www.conceptispuzzles.com/resource/1/183.pdf) | Conceptis 官方规则与题集 PDF | 彩色变体规则 |
| S10 | [Conceptis：Sym-a-Pix rules](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/sym-a-pix/rules) | Conceptis 官方规则 | 证明“旋转对称”在 Conceptis 产品中属于另一独立题种 |

## 10. 未解决问题

以下问题在公开一手资料中尚无答案，若主线需要严格复刻，应避免自行假定为 Conceptis 标准：

1. Hint 背后的求解算法、搜索深度和证明表达方式。
2. “Advanced”是否严格限定为两个线索，还是还允许更长的约束链。
3. 题目生成时判定“无需猜测”的确切机器规则和验证器。
4. 线索密度、黑白面积、连通性、图像可辨识度的生产阈值。
5. Colour Fill-a-Pix 在 2026 年是否仍作为常规商业产品维护。
6. Conceptis 是否存在未公开或非英文市场中的区域化、非矩形 Fill-a-Pix 变体。
