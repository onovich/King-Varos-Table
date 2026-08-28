# Proverbs 关卡设计逆向研究

更新时间：2026-08-27

研究对象：Mark Ffrench / Divide The Plunder 的《Proverbs》（Steam App 3083300）。

## 结论先行

《Proverbs》的“关卡”不是传统意义上的一关一关的战役，而是把一张巨型画布切成 259 个不规则区域。表面上玩家面对的是一个 54,000+ 格的单盘，实际游玩单位是可以独立完成的 region。官方公告明确说 Proverbs 比前作 Mega Mosaic 拥有更均衡的区域尺寸，而且线索不会“渗透”到邻区；每个区域本身就是一个自封闭谜题。[Proverbs 官方网站](https://www.proverbsgame.com/)、[开发者发布的 Proverbs Demo 公告](https://steamcommunity.com/app/2915950/allnews/)

它的核心关卡管线可以还原为：

    主题画作
      → 人工标出不规则区域
      → 为每个区域生成随机二值答案
      → 根据区域内 3×3 邻域计算完整线索
      → 用逻辑求解器检查是否能逐步解出
      → 对失败区域重新随机化
      → 以随机顺序删除冗余线索
      → 打包为可独立完成的区域，并绑定揭画、谚语和成就

因此，Proverbs 的关卡设计重点不是手工编写每一个数字，而是“人工设计空间分区 + 程序生成谜题 + 求解器验收 + 内容奖励编排”。

## 1. “关卡”到底是什么

官方资料给出的宏观结构是：

- 一张超过 54,000 格的连续巨型谜题；
- 259 个区域；
- 解完区域后逐步揭示 Bruegel 的《Netherlandish Proverbs》；
- 游戏有 90 多个成就，成就页中大量成就直接写成“Solve region X”。[官方商店页](https://store.steampowered.com/app/3083300/Proverbs/)、[官方成就页](https://steamcommunity.com/stats/3083300/achievements)

按官方“54,000+ 格”和 259 个区域计算，平均每个区域至少约 208 格；如果使用[官方预告片](https://www.youtube.com/watch?v=GOdcBtby5QM)界面中曾显示的 54,488 格，则平均约 210 格。但这是平均值，不代表区域大小相同。开发者明确说他希望 Proverbs 相比 Mega Mosaic 具有“更均衡的区域结构”，所以其设计目标是避免少数超大区域支配整个进度，而不是把 259 个区域做成完全同尺寸的标准关卡。

最准确的理解是：

> 一张巨型总地图，内部嵌着 259 个独立的小型逻辑关卡。

这带来一个重要区别：全盘的“连续性”主要是视觉、内容和进度连续性，不是逻辑约束连续性。玩家完成一个区域，并不会把该区域的推理信息传递给邻区。

## 2. 区域如何从画作中产生

开发者在访谈中公开说，他会先在插画上标出每个独立区域，然后再为区域生成谜题。这个表述说明 region mask 很可能是人工绘制或人工修订的内容资产，而不是单纯把矩形棋盘自动切块。[Mark Ffrench 开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

Proverbs 使用的是 Bruegel 的一张非常拥挤的群像画：画面中有超过 100 个谚语或成语相关的插图。区域形状因此不只是技术容器，还承担三个内容职责：

1. 把一张复杂画作拆成可逐步揭示的局部；
2. 为玩家提供可在十几分钟或更长时间内完成的局部目标；
3. 把部分画面细节、谚语说明和成就绑定到“完成某个区域”这一事件。

但不能把“区域”和“谚语”简单视为一对一关系。259 个区域明显多于 90 多个成就，成就页也只给部分 region 命名为谚语。因此公开资料更支持这样的模型：有些区域主要承担画面拼合，有些区域触发谚语内容，少数区域可能对应同一画面主题的不同部分。开发者没有公开完整的区域—谚语映射表。

## 3. 为什么必须使用不规则、自封闭区域

这是 Proverbs 相对 Mega Mosaic 最关键的关卡结构变化。

Mega Mosaic 使用较粗的区域边界和预填充边界格。开发者后来认为这种做法有两个问题：

- 代码必须处理跨区域边界的特殊情况；
- 玩家会觉得边界上的一整条格子已经替他们解掉了，像是“被送分”。

Proverbs 因此取消了这种厚边框/预填充结构。但取消后，普通矩形区域的起手线索会变少，而且边缘起点往往只会出现 0、9 或边缘上的 6、4。开发者的解决方式是让每个区域成为独立谜题，并使用不规则形状。这样区域边缘的有效邻域大小会变化，任何 0–9 都可能成为有用的起手数字。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

形式化地说，设一个区域为 R，某个格子的二值答案为 x，数字格 p 的 3×3 邻域为 N(p)，则它的线索可以理解为：

    clue(p) = sum of x(q), q 属于 R ∩ N(p)

也就是说，数字只统计同一区域内的有效格。若 p 在不规则边界上，实际邻域可能小于 9 格：

- 数字等于有效邻域大小时，邻域内全部为亮；
- 数字为 0 时，邻域内全部为暗；
- 形状越特殊，边界上可直接产生强约束的数字越多。

所以不规则边界同时改变了三件事：起手点数量、起手点种类和线索传播方式。它不是装饰，而是 Proverbs 的主要难度与可玩性旋钮。

官方后来还增加了区域高亮和更高缩放级别下的数字显示，说明区域边界对读题至关重要：玩家必须知道一个 3×3 范围究竟哪些格属于当前区域。[Proverbs 发布公告](https://store.steampowered.com/news/posts/?enddate=1731004357&feed=steam_community_announcements)

## 4. 单个区域的谜题生成流程

开发者公开的生成流程相当具体。

### 4.1 先生成一个二值目标答案

他先为区域生成一个随机的亮/暗二值答案，访谈中称为 random noise。这个答案不是最终彩色画的黑白缩略图，而是逻辑谜题内部的目标状态。

这解释了为什么 Proverbs 的区域在完成前看起来像随机噪声，而不是像 Picross 那样让玩家逐渐看见最终图像。开发者也明确表示，他尚未真正解决“如何把复杂插画转成好玩的黑白逻辑答案”这个问题，因此谜题层与彩色美术层是分开的。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

### 4.2 根据答案生成完整线索

先让每个格子都拥有一个由答案计算出来的数字线索。内部算法知道完整答案，玩家最终只会看到其中一部分数字。

区域边界会直接参与线索计算：跨越 region border 的格子不属于当前区域，不能被当前区域的线索统计。这就是“自封闭”在规则层面的含义。

### 4.3 用求解器检查逻辑可解性

开发者有一个能执行简单、后来也能执行高级推理的 solver，用来检查每个区域是否能在给定线索下被逐步解出。

如果一个区域在完整线索状态下仍然只能解出一部分，开发者会把尚未被求解器处理好的目标格重新随机化，再尝试生成。换句话说，随机答案不是生成后直接发布，而要经过 solver gate。

这里要区分两种保证：

- 已公开保证的是：游戏不要求玩家猜测，开发者也在 Steam 讨论区明确回答“never need to guess”；卡住时 Hint 会在当前区域找到下一步。[开发者 Steam 回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)
- 公开资料没有证明每个区域都经过严格的数学唯一解验证，也没有公开 solver 的完整推理规则。更稳妥的表述是：它保证对开发者所使用的逻辑求解器而言可完成。

### 4.4 删除冗余线索

所有线索先存在，然后算法以随机顺序遍历每个数字，尝试删除它：

1. 删除一个线索；
2. 再运行求解器；
3. 如果区域仍然可解，就永久删除该线索；
4. 如果不可解，就保留它。

最终得到的是一组没有明显冗余线索、且仍能由 solver 解出的题面。

这更接近“随机顺序的贪心削减”，不等于数学意义上的全局最少线索集合。随机访问顺序不同，也可能得到不同的保留线索集合。这个算法足以支撑大量区域生产，同时避免手工逐格调题。

## 5. Proverbs 的难度是如何产生的

公开资料没有给出每个 region 的难度表、线索数量表或固定的从易到难顺序。因此目前只能把难度来源分成“已确认”和“合理推断”。

### 已确认的难度来源

- 区域大小：开发者明确说 Proverbs 相比 Mega Mosaic 使用更均衡的区域尺寸；
- 区域形状：不规则边缘改变有效邻域大小和起手数字；
- 线索削减：保留哪些线索决定玩家能否快速找到下一步；
- solver 能力：区域必须满足指定求解器的逻辑推进要求；
- 边界可读性：游戏专门增加区域高亮、缩放显示和更清晰的边界。

### 最合理的设计推断

Proverbs 没有像后续 Mosaic of the Strange 那样提供可切换的难度档位，因此它的难度大概率主要被编码在每个区域自己的 mask、随机二值答案和削减后的 clue set 里。也就是说，区域难度不是玩家升级后解锁的新规则，而是“这个区域给你的第一批强线索有多少、约束传播有多快、边缘形状多有利”。

不过不能把后续作品的参数直接倒推到 Proverbs。开发者只明确公开了后续作品可以控制简单推理与高级推理的比例；他没有公开 Proverbs 各区域使用的具体比例，也没有说明是否对每个区域做过人工难度排序。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

## 6. 它的进度设计不是“解锁能力”，而是“完成与揭示”

Proverbs 几乎没有传统意义上的能力树、道具或角色成长。它使用的是另一种进度结构：

    选择一个可处理的区域
      → 找到局部起手线索
      → 逐格完成二值逻辑
      → 区域完成
      → 播放揭示/缩放反馈
      → 解锁彩色画面、谚语信息或成就
      → 回到巨型总图，选择下一个区域

官方网页把“259 个区域”“90+ 成就”“数十小时”并列宣传，说明区域本身就是时间切片和奖励节拍。玩家不需要等系统开放下一关，而是从总图中不断挑选下一个局部目标。完成区域后的揭示动画后来还被专门修订，更新说明提到动画会缩小镜头、显示刚完成的区域。[Proverbs 官方网站](https://www.proverbsgame.com/)、[Proverbs 更新记录](https://steamcommunity.com/app/3083300/allnews/)

## 7. 这种关卡设计的优点与代价

### 优点

1. 可扩展：只要有一张大图、一个区域 mask 和一套生成/验证工具，就可以生产大量内容。
2. 可控：solver gate 把“玩家卡死”变成制作阶段的问题，而不是发布后的运气。
3. 可分段：54,000 格不会以一个不可接受的整体压力砸给玩家。
4. 内容奖励清楚：逻辑完成、彩色揭示、谚语知识和成就形成连续反馈。
5. 形状有功能：不规则边界同时服务主题画面、起手线索和难度变化。

### 代价

1. 全盘不是一个真正互相依赖的逻辑题，而是许多独立谜题的视觉集合。
2. 随机二值答案与最终彩色画分离，玩家解题过程中无法通过答案图案理解自己正在画什么。
3. 没有公开的区域难度曲线，长期游玩中可能出现“规则已经熟悉，但挑战强度变化不明显”。
4. 边界语义增加了认知负担：同一个数字在普通内部格和不规则边缘格上的有效邻域不同，因此必须依赖边界高亮和清晰视觉提示。
5. 由于跨区线索被刻意切断，玩家完成某个区域后不会获得能用于邻区的新的逻辑资源。

## 8. 如果要复刻它，最小可行的关卡资产结构

每个区域至少应保存以下数据：

    RegionMask
    TargetBinarySolution
    VisibleClues
    RevealArt
    ContentReward
    AchievementBinding

制作工具需要支持：

- 画布上人工绘制或修订 region mask；
- 设置区域面积上下限；
- 生成二值目标；
- 按区域 mask 计算边界 3×3 线索；
- 运行与正式游戏一致的 solver；
- 删除冗余线索；
- 输出 solver 步数、第一步数量、卡顿点和错误率等指标；
- 预览区域在总图中的位置及完成后的揭示效果。

如果要做得比 Proverbs 更强，最值得补上的不是继续增加格数，而是增加一层可验证的难度设计：例如规定每个区域的最少起手点、最大连续推理深度、目标解题时长和玩家可见的内容反馈。Proverbs 已经解决了“巨型内容如何被切成可完成小块”，但没有公开证据表明它建立了系统化的区域难度曲线。

## 9. 已知事实、推断与未知项

| 项目 | 判断 | 依据 |
|---|---|---|
| 259 个区域 | 已确认 | 官方网站 |
| 54,000+ 格、单张巨型谜题 | 已确认 | 官方网站、Steam 商店页 |
| 区域尺寸比 Mega Mosaic 更均衡 | 已确认 | 开发者 Proverbs Demo 公告 |
| 区域自封闭，线索不跨区 | 已确认 | 开发者 Demo 公告、开发者访谈、实际讨论区说明 |
| 区域 mask 先于谜题生成 | 已确认/强证据 | 开发者访谈中的“先标出每个区域” |
| 二值答案从随机噪声开始 | 已确认 | 开发者访谈 |
| 使用 solver 验证并重新随机化失败区域 | 已确认 | 开发者访谈 |
| 通过随机顺序删除冗余线索 | 已确认 | 开发者访谈 |
| 区域难度主要由形状、面积和 clue set 产生 | 合理推断 | 生成流程与边界规则；未公开难度表 |
| 每个区域与一个谚语一一对应 | 不成立/未证实 | 259 区域与 90+ 成就数量不匹配 |
| 所有区域都拥有严格数学唯一解 | 未证实 | 没有公开唯一解验证或完整 solver 规格 |
| 每个区域的面积、线索数、难度、生成 seed | 未公开 | 公开资料未提供 |

## 10. “无猜解题器”的开发思路

这套系统的关键，不是先做一张看起来漂亮的题，再事后祈祷它能解，而是把“生成”和“求解”放进同一个闭环：

    生成候选答案
      → 根据答案计算完整线索
      → 用无猜 solver 验证
      → 失败则重随机未解决部分
      → 逐个删除冗余线索
      → 再次验证并导出关卡

### 10.1 把每个格子建模成二值变量

对每个有效格子定义一个变量 `x[i] ∈ {0, 1}`，表示暗/亮。每个数字线索则是一条约束：

    sum(x[i] for i in clue.neighbours_in_same_region) = clue.number

注意这里的邻居不是固定的 8 格，而是“3×3 范围内、且属于同一区域的格子”。因此 region mask 必须参与约束计算；不规则边界既是视觉结构，也是求解器的数据。

### 10.2 Solver 只做“必然推导”，不做试填

可实现的最小 solver 可以维护三种状态：已亮、已暗、未知。对每条约束维护：

    remaining = clue.number - 已确定为亮的数量
    unknown   = 仍未确定的邻居数量

然后反复应用两条最基本的确定性规则：

    remaining == 0       → 所有 unknown 都是暗格
    remaining == unknown → 所有 unknown 都是亮格

每次确定一个格子，就更新它所在区域内的相邻线索，并把受影响的线索重新加入待处理队列。这样形成一个事件驱动的约束传播循环，而不是每一步扫描整张大图。

### 10.3 “高级推导”是可插拔的一层

如果基础规则达到固定点但仍有未知格，solver 可以继续做可靠的约束关系推导，例如比较两条约束的重叠部分，推出一个约束相对于另一个约束新增的格子集合及其亮格数量。关键要求是：高级规则也只能产生逻辑必然结论，不能任选一个可能值。

开发者公开说他的 solver 能做简单、后来也能做高级推导，但没有公开高级规则的完整规格。因此上面这一层是实现方向，不应当当作 Proverbs 的已证实源码细节。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

### 10.4 生成器如何利用 solver

开发者描述的做法可以还原成如下伪代码：

    repeat:
        solution = random_binary_assignment(region)
        clues = calculate_all_clues(solution, region_mask)
        result = no_guess_solver(clues)

        if result == fully_solved:
            break

        randomise_the_unresolved_tiles(solution)

    for clue in random_shuffle(clues):
        trial = clues without clue
        if no_guess_solver(trial) == fully_solved:
            clues = trial

这里的“可解”不是调用一个会回溯试错的通用求解器，而是要求指定的逻辑 solver 从未知状态一路推导到完整答案。开发者明确提到：即使所有数字都显示，也不是每个随机答案都能被他的 solver 解出；失败区域会重新随机化后再试。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

### 10.5 为什么删除线索后仍然不会让玩家必须猜

删除阶段从“全线索题”开始。对每个候选线索做一次试删：

    删除后仍可由无猜 solver 完成 → 永久删除
    删除后 solver 卡住或矛盾       → 恢复

因此最终题面至少满足两个性质：

- 对当前 solver 来说可以完整推导；
- 已保留的线索中，没有一个能在该删除顺序下被证明为多余。

第二点不代表它是全局最少线索集。因为删除是随机顺序的，前面保留的线索可能在后面删除其他线索后变得冗余；如果要追求最小线索集，需要重复多轮删除或做更昂贵的组合优化。Proverbs 的公开描述只承诺“可解且没有冗余线索”，没有说明它做了全局最小化。

### 10.6 无猜可解与严格唯一解的区别

严格的唯一解验证通常是：用 SAT、约束回溯或解计数器寻找第二个不同解，要求解的数量恰好为 1。开发者公开资料没有提到这一步。

但如果 solver 的每个推导规则都是正确的逻辑蕴含，并且它能在不分支、不猜测的情况下填完整个区域，那么它实际已经把每个格子的值都推成了必然结论；在这个前提下，不会存在第二个满足同一组约束的解。也就是说：

    “solver 完整推导”是玩家体验层面的无猜保证
    “解计数 == 1”是数学层面的独立证明

做自己的游戏时，建议两层都保留：先用人类式 solver 检查推理路径，再用 `countSolutions(limit=2)` 检查是否存在第二个解。这样既不会出现“数学上唯一但玩家只能暴力试”的题，也不会因为 solver 有 bug 而误把错误答案当成唯一解。

## 11. MiniZinc 可行性

如果每个区块的形状已经确定，MiniZinc 足以表达 Proverbs 的核心约束，也足以验证严格唯一解；但不建议把“MiniZinc 找到一个解”直接当成“玩家无需猜”。MiniZinc 的有限域求解本身可以通过搜索、分支和回溯寻找满足赋值，这些过程对玩家来说就是猜测。[MiniZinc Handbook：Search](https://docs.minizinc.dev/en/stable/mzn_search.html)

### 11.1 适合交给 MiniZinc 的部分

对一个区域预先计算每个数字格的有效邻居集合 `N[c]` 后，核心模型很简单：

    var 0..1: x[i];
    constraint forall(c in CLUES)(
        sum(i in N[c])(x[i]) = clue[c]
    );

其中 `N[c]` 只包含同一区域、3×3 范围内的格子。MiniZinc 的 `count` 和求和约束可以表达这一类有限域计数关系。[MiniZinc Handbook：Counting constraints](https://docs.minizinc.dev/en/stable/lib-globals-counting.html)

MiniZinc 适合做三件事：

1. 验证一组区域形状和数字是否有解；
2. 在找到候选答案后，通过增加“至少一个格子不同”的阻塞约束，检查是否存在第二个解；
3. 在删除线索的过程中，作为精确约束检查器。

严格唯一解不必真的输出所有解。已知一个答案 `target` 后，可以增加：

    constraint exists(i in CELLS)(x[i] != target[i]);

如果这个模型无解，说明没有第二个答案，`target` 是唯一解。MiniZinc 也支持满足问题的多解输出和限制输出解的数量，例如 `-a` 与 `-n 2`；阻塞约束通常更适合做“是否存在第二解”的检查。[MiniZinc Handbook：Multiple solutions](https://docs.minizinc.dev/en/2.9.2/modelling2.html)、[MiniZinc command line options](https://docs.minizinc.dev/en/2.9.0/command_line.html)

### 11.2 不适合只交给 MiniZinc 的部分

“无猜”是关于推理过程的性质，不只是关于最终答案的性质。一个 MiniZinc CP solver 可以通过搜索找到唯一答案，但玩家未必能通过确定性规则得到它。因此推荐使用混合架构：

    宿主程序（Python/C#/Rust）
      ├─ 随机生成目标黑白图
      ├─ 计算区域邻居集合与数字
      ├─ 运行 HumanSolver / NoGuessSolver
      ├─ 删除线索并测量难度
      └─ 调用 MiniZinc 检查是否存在第二解

`HumanSolver` 应明确禁止以下行为：

- 任意选择一个未知格进行试填；
- 分支、回溯或“假设一个值再看矛盾”；
- 读取隐藏的目标答案来帮助推理。

它只应用已定义的确定性规则，直到出现三种结果之一：完整填满、发现矛盾、没有新必然结论但仍有未知格。第三种结果就是“对当前规则集不可无猜”，生成器应拒绝该候选关卡。

### 11.3 推荐的生成验证流水线

    for each region:
        target = seeded_random_binary_assignment(region)
        clues = calculate_clues(target, region_mask)

        reject unless HumanSolver(clues).solves_completely()
        reject unless MiniZincHasNoSecondSolution(clues, target)

        for clue in shuffled(clues):
            trial = remove(clue)
            keep removal only if:
                HumanSolver(trial).solves_completely()
                and MiniZincHasNoSecondSolution(trial, target)

        export(region_mask, target_hidden, visible_clues, metrics)

因为 Proverbs 的区域是自封闭的，这个检查可以逐区块进行，而不是把整张五万多格的大图作为一个约束模型。这样也便于输出每区块的面积、线索数、首步数量、推理步数和高级规则占比。

### 11.4 结论

在“区块形状已划分好”的前提下，MiniZinc 可以实现核心约束和严格唯一解验证。但最稳妥的方案不是 MiniZinc 单独负责全部生成，而是：

    MiniZinc = 数学正确性 / 第二解检查
    HumanSolver = 无猜性 / 玩家推理路径检查
    宿主脚本 = 随机生成、删线索、难度筛选、批量导出

这也最接近 Proverbs 开发者公开描述的思路：使用一个能进行简单和高级推导的 solver 验证区域，再通过删除线索保持可解。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

## 主要来源

1. [Proverbs 官方网站](https://www.proverbsgame.com/)
2. [Proverbs Steam 商店页](https://store.steampowered.com/app/3083300/Proverbs/)
3. [Proverbs Demo 公告（开发者 Mark，Mega Mosaic Steam 新闻页）](https://steamcommunity.com/app/2915950/allnews/)
4. [Mark Ffrench 开发者访谈：Mosaic of the Strange](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)
5. [开发者关于“是否需要猜测”的 Steam 回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)
6. [Proverbs 正式发布公告与后续改进](https://store.steampowered.com/news/posts/?enddate=1731004357&feed=steam_community_announcements)
7. [Proverbs 官方成就列表](https://steamcommunity.com/stats/3083300/achievements)
