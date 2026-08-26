# LearnProverbs：Proverbs 专项研究交接

更新时间：2026-08-27  
交接目标：在 `D:\WebProjects\LearnProverbs` 继续研究 Proverbs 的玩法、关卡生成、无猜解题器，以及 MiniZinc 是否适合作为生成验证工具。

## 1. 旧会话与迁移范围

此前的专项调研会话：

- 会话标题：`调研Proverbs与扫雷创新玩法`
- Codex task/thread ID：`019fb47d-ee9b-7581-afdf-54fff28c4a54`

旧工作区：`C:\Users\Administrator\Documents\Playground 2`  
本交接目录：`D:\WebProjects\LearnProverbs`

本次迁移是增量复制，没有删除或覆盖旧工作区内容。

## 2. 已迁移的资料

### Proverbs 专题

位于 [`research/proverbs`](research/proverbs)：

1. [`proverbs-level-design-research-2026-08-27.md`](research/proverbs/proverbs-level-design-research-2026-08-27.md)  
   重点：区域切分、关卡管线、随机答案、solver 验证、线索裁剪、进度与奖励结构、MiniZinc 可行性。
2. [`proverbs-and-creative-minesweeper-landscape-2026-07-31.md`](research/proverbs/proverbs-and-creative-minesweeper-landscape-2026-07-31.md)  
   重点：Proverbs 的规则谱系、Fill-a-Pix/Mosaic 基线、原创性边界和同类市场。
3. [`proverbs-game-originality-2026-07-31.md`](research/proverbs/proverbs-game-originality-2026-07-31.md)  
   重点：玩法拆解、同类作品、原创性判断、区域规则和奖励结构。

### 比较背景

位于 [`research/comparative`](research/comparative)：

1. [`creative-minesweeper-variants-2026-07-31.md`](research/comparative/creative-minesweeper-variants-2026-07-31.md)
2. [`large-scale-interesting-minesweeper-2026-07-31.md`](research/comparative/large-scale-interesting-minesweeper-2026-07-31.md)
3. [`minesweeper-variants-detailed-large-worlds-2026-07-31.md`](research/comparative/minesweeper-variants-detailed-large-worlds-2026-07-31.md)
4. [`minesweeper-variants-detailed-logic-topology-2026-07-31.md`](research/comparative/minesweeper-variants-detailed-logic-topology-2026-07-31.md)
5. [`minesweeper-variants-detailed-mechanics-2026-07-31.md`](research/comparative/minesweeper-variants-detailed-mechanics-2026-07-31.md)

这些文件中的来源链接、事实/推断区分和原始调研日期均已保留。

## 3. 当前共识：Proverbs 到底是什么玩法

Proverbs 不是传统的“一个关卡一个棋盘”，而是一张五万多格的巨型画布，拆成多个可独立完成的不规则区域。每个格子是亮/暗二值状态，数字表示以该格为中心的 3×3 范围内应有多少亮格；实际计算时只统计同一区域内的格子。区域边界因此同时承担视觉分割和约束边界的作用。

它更准确的规则归类是 Fill-a-Pix/Mosaic，而不是严格意义上的“扫雷 + Nonogram”。它的主要特色在于内容编排：巨型画布、不规则自封闭区域、布鲁盖尔《尼德兰箴言》的彩色揭示、谚语说明、成就和长期拼图节奏。

## 4. 已确认的关卡生成思路

根据开发者公开访谈，生成管线可以还原为：

```text
人工标记每个区域
    ↓
随机生成一组完整黑白答案
    ↓
根据答案计算所有数字线索
    ↓
运行只做逻辑推导的 solver
    ↓
如果区域无法完整推导，重新随机化未解决部分
    ↓
从完整线索集开始，随机尝试删除线索
    ↓
删除后仍可完整推导才永久删除
    ↓
导出区域、隐藏答案、可见线索和奖励绑定
```

开发者公开说他的 solver 可以进行简单、后来也加入高级推导，并用它检查每个区域是否可解；公开资料没有给出源码或高级规则的完整规格。

## 5. “无猜”与“唯一解”必须分开验证

### 无猜

需要一个玩家式的 `NoGuessSolver`：

- 状态只有亮、暗、未知；
- 只能应用确定性规则；
- 不允许试填、分支、回溯或读取隐藏答案；
- 如果没有新必然结论但仍有未知格，则关卡对当前规则集不可无猜，应拒绝。

基础规则：

```text
剩余亮格数 = 0
→ 所有未知格都是暗格

剩余亮格数 = 未知格数量
→ 所有未知格都是亮格
```

之后可以加入约束重叠、集合包含等高级推导，但必须保证每一步都是逻辑必然结论。

### 唯一解

MiniZinc 可以验证严格唯一性。先得到一个答案 `target`，再给原约束加入：

```minizinc
constraint exists(i in CELLS)(x[i] != target[i]);
```

如果这个模型被完整证明为无解，就不存在第二个答案。注意必须区分 `UNSAT` 和超时/`UNKNOWN`。

因此推荐：

```text
NoGuessSolver = 玩家能否通过逻辑完成
MiniZinc     = 是否存在第二个数学解
```

唯一解并不自动意味着玩家无需猜；一个谜题可能数学上唯一，但只能通过搜索得到。

## 6. MiniZinc 的推荐定位

在区块形状已经划分好的前提下，MiniZinc 可以表达每个区域的核心约束：

```text
x[i] ∈ {0, 1}
sum(x[i] for i in clue.neighbours_in_same_region) = clue.number
```

建议不要让 MiniZinc 单独承担全部流程：

```text
宿主程序 Python / C# / Rust
    ├─ 维护 region mask
    ├─ 随机生成 target
    ├─ 计算邻居集合与线索
    ├─ 运行 NoGuessSolver
    ├─ 删除线索并统计难度
    └─ 调用 MiniZinc 检查唯一解
```

Proverbs 的区域自封闭，所以应该优先逐区域验证，而不是一开始把整张五万多格画布作为一个模型。每个区域最好预先保存：

```text
RegionMask
TargetBinarySolution
VisibleClues
NeighbourSets
DifficultyMetrics
RevealArt / ContentReward
```

## 7. 已知事实、合理推断和未知项

### 已确认

- Proverbs 使用巨型单画布和多个区域；官方资料宣传 54,000+ 格、259 个区域。
- Proverbs 的区域比 Mega Mosaic 更均衡，并且每个区域是自封闭谜题。
- 开发者先标记区域，再从随机黑白答案计算线索。
- 开发者使用逻辑 solver 验证区域；无法完整解决的候选会重新随机化。
- 线索会按随机顺序尝试删除，删除后仍可解才保留删除。
- 开发者将系列作品描述为纯逻辑、无需猜测。

### 合理推断

- 区域面积、形状、边界有效邻居集合和线索分布共同形成主要难度来源。
- 线索删除是局部贪心裁剪，不一定得到全局最少线索集。
- 最适合复刻的实现是“宿主程序负责生成和玩家式求解，MiniZinc 负责精确约束检查”。

### 尚未确认

- Proverbs 是否额外运行了独立的“解计数器”，严格验证每个区域恰好只有一个解。
- 开发者的高级推导规则、具体 solver 代码和生成 seed。
- 每个区域的面积分布、线索密度、平均推理深度和难度曲线。
- 最终彩色画面与隐藏二值答案之间是否存在系统性内容对齐；公开访谈反而说明两者并非简单同构。

## 8. 官方/一手来源入口

- [Proverbs 官方网站](https://www.proverbsgame.com/)
- [Proverbs Steam 商店页](https://store.steampowered.com/app/3083300/Proverbs/)
- [Proverbs Demo 公告与区域系统说明](https://steamcommunity.com/app/2915950/allnews/)
- [Mark Ffrench 开发者访谈：Mosaic of the Strange](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)
- [Proverbs 正式发布公告与后续改进](https://store.steampowered.com/news/posts/?enddate=1731004357&feed=steam_community_announcements)
- [开发者官网](https://www.markffrench.com/)
- [开发者关于是否需要猜测的 Steam 回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)
- [MiniZinc Handbook：Search](https://docs.minizinc.dev/en/stable/mzn_search.html)
- [MiniZinc Handbook：Multiple solutions](https://docs.minizinc.dev/en/stable/modelling2.html)

## 9. 建议的新工作区第一阶段

1. 固化规则定义：3×3 是否包含中心格、区域边界如何裁剪、非可玩格如何处理。
2. 建立 `region mask → neighbour sets` 的数据格式和校验器。
3. 写一个最小 `NoGuessSolver`，先只支持 0 规则和“剩余数等于未知数”规则。
4. 用 MiniZinc 实现区域约束和第二解阻塞检查。
5. 做一个小型生成器：随机答案 → 计算线索 → 无猜验证 → 唯一解验证 → 贪心删线索。
6. 记录每个区域的首步数量、确定性步数、最大连续推理深度、线索数和运行时间。
7. 再决定是否加入高级推导、全局难度分层和内容/答案图案对齐。

## Suggested skills

后续工作可按需使用：

- `research`：继续核查 Proverbs/Mosaic 的一手资料或规则细节。
- `prototype`：快速验证区域生成、无猜求解和 MiniZinc 联动。
- `implement`：把已确定的生成器/求解器落到项目代码。
- `tdd`：为邻域计算、唯一性检查和求解规则建立测试。
- `domain-modeling`：固定 Region、Clue、Solution、SolverStep 等领域概念。
- `codebase-design`：在生成器、验证器和运行时提示器之间划分模块边界。
