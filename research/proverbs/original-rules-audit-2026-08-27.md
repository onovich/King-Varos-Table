# 《Proverbs》原版规则与提示行为审计

- 审计日期：2026-08-27
- 对象：Mark Ffrench / Divide The Plunder 于 2024 年发行的 Steam 游戏《Proverbs》（App 3083300）
- 目的：核查原版的计数、区域、标记、提示与推理难度，并与当前 LearnProverbs 实现对照

## 结论摘要

原版的核心规则可以写成：对区域 `R` 内的数字格 `c`，数字等于“以 `c` 为中心、横纵各相距不超过 1 格的 3×3 范围”与该区域交集中的亮格数量。

```text
clue(c) = Σ bright(p)
           p ∈ board ∩ R ∩ {与 c 的行差、列差都 ≤ 1 的格子}
```

因此：

1. 数字统计的是**亮格/填色格**，不是暗格/空格。
2. 3×3 **包含数字所在的中心格**；否则邻格至多只有 8 个，官方明确存在的数字 9 就无法成立。
3. 区域是独立小谜题。数字的范围会被区域边界裁剪，其他区域的格子不计入；棋盘外当然也不计入。
4. 玩家用两种状态表达“此格是亮格”和“此格是暗格（排除亮格）”。多份原版实玩记录一致描述默认操作为左键亮、右键暗；官方更新还确认 `Shift+左键` 可替代右键。
5. 原版明确使用 **0–9** 全部取值。
6. 原版开发者明确承诺**不需要猜**，并说 Hint 会在玩家当前聚焦的区域里找下一步。
7. 目前能查到的原版实玩资料显示，Hint 的可见行为是把镜头带到一个“现在可解的单个 3×3 数字范围”，让玩家自己处理；没有一手资料表明它会直接指定某一目标格，亦没有证据表明它会展示“两线索作差”等组合证明。
8. 开发者把“高级推理”作为后续作品的新可选机制，并在访谈里用“现在也能做高级推断”描述新版生成器。由此强烈推断：《Proverbs》原版关卡的必需推理基线是单线索的简单归约，而不是当前实现中的重叠线索差集。
9. 官方确认的是“无猜/可逻辑完成”，**未找到官方对每个区域形式化保证唯一解的明确陈述**。当前项目的 MiniZinc 唯一性验证属于更强的工程保证，不能反向宣称是原版公开规则。

## 证据等级

- **已确认**：官方商店、游戏官网、开发者本人回复或开发者访谈直接说明；或由官方定义严格推出。
- **强推断**：多份彼此独立的实玩观察一致，并与一手资料相容；或由多条一手资料共同强烈指向，但没有原版官方逐字说明。
- **未知**：公开资料不足，不能可靠断言。

## 逐项核查

| 问题 | 结论 | 等级 | 关键证据 |
|---|---|---|---|
| 数字统计亮格还是暗格 | 统计亮格 | **已确认** | [Steam 官方商店](https://store.steampowered.com/app/3083300/Proverbs/)和[游戏官网](https://www.proverbsgame.com/)都说明 0–9 表示线索一格范围内必须放置的亮格数。 |
| 3×3 是否包含中心 | 包含 | **已确认** | 官方范围为 0–9；排除中心最多只能数到 8。[The Gaming Outsider 的原版实玩](https://thegamingoutsider.com/2024/12/16/proverbs-pc-review/mszymanski/)也明确把数字所在格计入九格。 |
| 区域边界如何裁剪 | 只取同一区域内的 3×3 交集 | **已确认** | 开发者说明每个区域必须是独立、自封闭的谜题，且不规则边缘会改变起始数字条件；见[Mark Ffrench 访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)。[Steam 玩家实测](https://steamcommunity.com/id/Razorflamekun/recommended/3083300/)也明确记录区域边缘就是线索的墙/边界。 |
| 边界外或其他区域是否忽略 | 是 | **已确认** | “区域自封闭”若仍跨区计数便不能成立；社区中针对“为什么 0 不是 0”的实盘解释也一致指出只数同一区域，见[该讨论](https://steamcommunity.com/app/3083300/discussions/0/666114913574397957/)。 |
| 两种标记的语义 | 亮格确认；暗格确认/排除亮格 | **强推断** | [The Gaming Outsider](https://thegamingoutsider.com/2024/12/16/proverbs-pc-review/mszymanski/)和[ChattySami 的原版实玩](https://chattysami.wordpress.com/2026/08/23/little-inferno-glass-masquerade-proverbs/)均描述左键置亮、右键置暗；[官方更新日志](https://steamcommunity.com/app/3083300/allnews/)确认后来加入 `Shift+click` 作为右键替代，但未在公开文字中完整定义两键语义。 |
| 是否真的出现 0–9 | 是 | **已确认** | 官方两处规则页直接写 0–9；[官方截图](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3083300/ss_e18d0fcc2cbc52d2189f5596bda07a3923c58cec.1920x1080.jpg?t=1763461008)亦可见高位数字。 |
| Hint 的作用域 | 当前聚焦区域 | **已确认** | 开发者在 [Steam 讨论回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)中明确说 Hint 会在当前聚焦区域找下一步。 |
| Hint 是单格结论还是组合关系 | 可见行为更像定位一个可直接解的单线索 3×3；未证实会给组合关系 | **强推断** | [The Geekly Grind 的《Proverbs》实玩评测](https://www.thegeeklygrind.com/all-posts/proverbs-review)描述点击 Hint 后镜头移到一个可解的 3×3，给玩家新的起点。没有找到原版官方资料展示“圈出目标格”或“两线索差集证明”。 |
| 官方是否承诺无猜 | 是 | **已确认** | 开发者在[上述 Steam 回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)直接表示永远不需要猜。 |
| 官方是否承诺唯一解 | 未找到明确公开承诺 | **未知** | 开发者说明生成器会检查每一区域可解，并删除冗余线索；但公开材料没有使用“exactly one solution/unique solution”一类形式化措辞。 |
| 原版是否要求高级推理 | 很可能不要求 | **强推断** | 开发者访谈把求解器“现在也能做高级推断”放在后续作品语境；[官方公告](https://steamcommunity.com/app/3083300/allnews/)又把 Advanced Deduction 称为下一作的新可选机制。 |

## 1. 数字究竟在数什么

官方 Steam 商店和游戏官网使用了同一规则表述：数字线索 0–9 表示该线索一格范围内必须放置多少个亮格。[Steam 官方商店](https://store.steampowered.com/app/3083300/Proverbs/)；[游戏官网](https://www.proverbsgame.com/)。所以把数字解释为“周围暗格数”“空白格数”或“只数未标记格”都与原版相反。

数字是固定的目标总数，不是动态剩余数。玩家落笔以后，可用下面的残差帮助推理：

```text
尚需亮格数 = 数字 − 该范围内已确认亮格数
```

若尚需亮格数为 0，范围内所有未知格都必暗；若它等于未知格数，范围内所有未知格都必亮。这正是原版所称的简单、无需猜的局部推理。

## 2. 中心格与 3×3 范围

“一格以内”按棋盘距离理解为行差和列差都不超过 1，也就是最多九格的 3×3。数字所在格本身与自己的距离为 0，因此包含在范围中。

还有一个排除歧义的硬证据：官方明确允许数字 9。若只算中心周围八格，9 永远不可能出现。原版实玩说明也用“数字占据的九格 3×3”解释规则，并举例 9 要求九格全亮、0 要求九格全暗。[The Gaming Outsider](https://thegamingoutsider.com/2024/12/16/proverbs-pc-review/mszymanski/)。

## 3. 区域边界与棋盘边缘

开发者解释《Proverbs》的设计变化时说，去掉粗分隔后仍要求每个区域成为独立、自封闭的谜题；不规则区域形状也让 0–9 中任何数字都有机会成为开局线索。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)。这意味着线索的有效集合不是几何 3×3 的全部格子，而是：

```text
几何 3×3 ∩ 棋盘内格子 ∩ 线索所属区域
```

所以：

- 紧邻数字但属于另一区域的格子完全忽略；
- 越过区域边界后，不会在相邻区域继续计数；
- 位于棋盘外的坐标不存在，自然忽略；
- 区域边缘的线索可能只覆盖 1–8 格，因此 0、1 等线索在不规则边缘尤其容易成为起点。

这条规则确实曾令玩家困惑：一名玩家看到视觉上邻接的亮格后质疑“0 为什么不是 0”，其他玩家解释必须按区域裁剪。[Steam 讨论](https://steamcommunity.com/app/3083300/discussions/0/666114913574397957/)。2025 年官方还专门调整过 How to Play 文案，以澄清常见误解，但公告没有列出改写全文。[官方更新日志](https://steamcommunity.com/app/3083300/allnews/)。

## 4. 两种玩家标记

原版每格最终是二值状态：亮或暗。实玩资料一致描述默认鼠标语义为：

- 左键：确认该格为亮格/填色格；
- 右键：确认该格为暗格，即明确排除其为亮格；
- 再次操作可撤回或切换，具体手感可能受设置与版本影响。

两种标记都不是“临时猜测”：它们是在记录玩家已经推出的真值。原版还有可配置的错误反馈，因此“游戏是否立即告诉你点错”与逻辑规则是两回事。

这里保留为**强推断**而非一手“已确认”，因为官方公开页面只明确记录了 `Shift+左键` 可替代右键，没有找到官方逐字列出左右键对应颜色的现行说明；对应关系来自两份独立原版实玩记录。[The Gaming Outsider](https://thegamingoutsider.com/2024/12/16/proverbs-pc-review/mszymanski/)；[ChattySami](https://chattysami.wordpress.com/2026/08/23/little-inferno-glass-masquerade-proverbs/)；[官方更新日志](https://steamcommunity.com/app/3083300/allnews/)。

## 5. 原版 Hint/教学行为

### 已确认

- Hint 不应跨整幅画面任意寻找：开发者明确把范围限定在玩家**当前聚焦的区域**。[开发者 Steam 回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)。
- Hint 的目标是找“下一步”，不是容许猜测；同一回复明确保证不需要猜。
- 原版 UI 确实有 Hint 按钮；可见于[官网嵌入的官方预告片](https://www.youtube.com/watch?v=GOdcBtby5QM)及[Steam 官方截图](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3083300/ss_0bc8e7f5227b1f016f9b6f3cbedbb275d6400573.1920x1080.jpg?t=1763461008)。

### 强推断

原版 Hint 的可见输出是“定位一个目前可直接处理的数字范围”，而不是替玩家填格或宣判某个单格。The Geekly Grind 的原版实玩记录称，点击 Hint 后镜头会移到一个可解的 3×3，让玩家得到新的起点。[原版评测](https://www.thegeeklygrind.com/all-posts/proverbs-review)。

结合开发者关于原版简单推断的生成方式，最符合资料的 Hint 合同是：

1. 在当前区域读取玩家现有标记；
2. 找一个残差已经为 0，或残差等于未知格数的数字线索；
3. 聚焦/高亮该数字及其被区域裁剪后的范围；
4. 让玩家自行把该范围内的必然格标完。

### 未知

- 未找到原版一手材料逐帧展示 Hint 的高亮样式、持续时间或冷却秒数。
- 未找到证据证明原版 Hint **绝不**在内部比较多个线索；但也没有证据表明它会把组合关系展示给玩家。
- 未找到原版 Hint 会输出证明文字、圈出一个目标格、同时圈出多个源线索或自动落子的资料。

因此，对“原版 Hint 是否可能给组合关系”最严谨的回答是：**内部算法未知；已观察到的玩家可见行为是单个可解 3×3，公开证据不支持当前这种两线索差集证明 UI。**

## 6. 无猜、唯一解与“高级推理”不是同一件事

### 无猜：已确认

开发者直接表示玩家永远不需要猜，并说明生成器会检查每个区域是否可解。[Steam 开发者回复](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)；[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)。访谈还说明，生成时先让每格都有数字，再随机尝试删除线索；删后仍可解才保留删除结果，从而得到没有冗余线索的区域。

### 唯一解：公开资料不足

“求解器能从给定线索完整推出目标图”通常会导向唯一解，但这取决于求解器所用推理规则的完备性与开发者对“solvable”的精确定义。原版公开材料没有形式化声明“每一区域恰有一个满足赋值”，也没有公开约束模型或双解排除测试。因此只能确认原版承诺无猜可解，不能把“官方明确承诺唯一解”写进复刻规则。

当前项目用 MiniZinc 做唯一性验证是合理且更强的质量保证，但应在产品文案中表述为本项目的保证，而不是原版已证实特性。

### 高级推理：很可能不是原版必需机制

开发者谈到后续作品《Mosaic of the Strange》时说，求解器“现在”可以做简单和高级推断，并能按难度要求两类步骤比例；同时，Steam 官方公告把 Advanced Deduction 称为下一作面向硬核玩家的“新可选机制”。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)；[官方公告汇总](https://steamcommunity.com/app/3083300/allnews/)。

这两条一手证据共同强烈指向：

- 《Proverbs》原版的生成/验题基线是单线索简单推断；
- 高级推断是后来新增并可选的难度层；
- 当前项目若让关卡必须依赖重叠线索差集才能继续，就不是在严格还原原版默认难度。

仍需保留一点边界：公开资料没有发布原版求解器源码，所以不能证明原版的每个实际盘面在任何玩家落笔顺序下都始终存在一个单线索零/满步骤；这里的结论是设计与生成意图，而不是对全部 54,000 格逐局形式验证。

## 7. 与当前 LearnProverbs 实现的对照

以下只做只读审计，没有修改实现文件。

| 当前实现 | 与原版关系 | 判断 |
|---|---|---|
| `web/puzzle-logic.mjs` 用 `BRIGHT = 1`、`DARK = 0`，数字约束求亮格和 | 一致 | 保留。 |
| `neighboursForCell` / `neighbours_for_cell` 把 3×3 限于棋盘内和同一区域 | 一致 | 保留，并在教学中把“跨区不计”讲得更显眼。 |
| 0–9 数字、中心格计数、左亮右暗 | 一致或高置信一致 | 保留。 |
| “整页”状态下 Hint 可遍历所有区域（`web/app.js` 的 `hintItems`） | 与开发者明确的“当前聚焦区域”不一致 | Hint 应要求/采用当前聚焦区域；“全图找一步”可另做非原版辅助功能。 |
| `findNextHint` 最终返回一个目标 `cell`，UI 用橙框宣告该格亮/暗 | 与已观察到的原版 Hint 输出不一致 | 原版式 Hint 应突出源数字和完整有效范围，让玩家自己落子。 |
| `web/puzzle-logic.mjs` 构造重叠约束的子集差，`web/hint-proof.mjs` 和 `web/app.js` 展示 `subset-difference` 证明 | 没有原版依据，且很可能属于后续作品才引入的高级机制 | 不应作为默认“给我一个必然步骤”；可隔离为明确标注的可选“高级分析”。 |
| 候选排序优先依赖玩家标记，再优先基础推理 | “读取当前盘面”方向正确 | 应继续保留，但输出应改成当前区域内的可解线索范围。 |
| Python 生成器标称 no-guess，并用 MiniZinc 验证唯一性 | 比原版公开保证更强 | 可保留为项目质量门槛，但不要混同于原版官方承诺。 |

特别要区分两类问题：当前差集结论可能在数学上成立，但它仍可能**不符合原版 Hint 的行为合同**。用户觉得“无厘头”不一定代表布尔求解错误；更可能是界面先宣判目标格、同时引入多个坐标与差集，却没有先让玩家看到“哪个数字的哪个有效范围已经能直接处理”。

## 8. 建议的原版式整改验收标准

1. Hint 只查询当前聚焦区域；没有聚焦区域时，先要求选择区域或按当前镜头中心确定区域，不静默跨区。
2. Hint 必须以玩家当前 `UNKNOWN/BRIGHT/DARK` 状态重算残差，不得根据隐藏答案挑格。
3. 默认只接受单线索直接规则：`remaining == 0` 或 `remaining == unknownCount`。
4. 高亮源数字及其“同区、棋盘内”的完整有效范围；不要默认只橙框一个待填目标格。
5. 提示文案使用可目检的算式，例如：“数字 4；范围内已亮 2；还有 2 个未知，所以两格都亮。”
6. 若当前区域没有单线索直接步骤，原版模式应明确说“当前区域没有基础提示”，而不是悄悄升级为两线索差集。
7. 若保留差集推理，应放在独立的“高级分析”入口，清楚显示两个源范围、集合包含关系和差集，不称其为原版 Hint。
8. 自动化测试至少覆盖：
   - 同一个谜题在不同玩家落笔状态下返回不同且仍成立的提示；
   - 提示不访问隐藏目标图；
   - 提示不跨区域；
   - 所有高亮待处理格都被该单线索残差直接强制；
   - 区域边缘的 3×3 正确裁剪；
   - 中心格包含在计数中；
   - 0 与 9，以及边缘上有效范围不足九格的零/满规则。

## 9. 仍然未知或不应过度宣称的事项

- 原版 Hint 的准确冷却时长和各版本是否变化。
- 原版设置中是否允许反转左右键，以及所有平台当前版本的默认映射；目前只有实玩记录与 `Shift+click` 官方更新可交叉验证。
- 原版 Hint 的内部搜索算法是否曾使用多线索信息来选择聚焦点；公开资料只足以判断玩家可见输出。
- 官方是否在未索引的 Discord 消息或游戏内最新版教程中明确写过唯一解；本次可公开核验的一手资料没有找到。
- “没有冗余线索”不等于“每条线索在玩家任意中盘状态下都能单独直接推出一步”，两者不可混淆。

## 来源清单与可信度

### 一手资料

1. [Steam 官方商店：《Proverbs》](https://store.steampowered.com/app/3083300/Proverbs/)：0–9、亮格、一格范围、开发者与发行者身份。
2. [《Proverbs》游戏官网](https://www.proverbsgame.com/)：重复核心规则、官方预告片与截图入口。
3. [开发者 Steam 回复：无需猜，Hint 在聚焦区域找下一步](https://steamcommunity.com/app/3083300/discussions/0/601905999576612768/)：无猜与 Hint 作用域。
4. [Mark Ffrench 访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)：区域自封闭、原版删线索生成方式、简单/高级推断的代际差异。文章为媒体整理，但内容是开发者第一人称原话。
5. [Steam 官方公告汇总](https://steamcommunity.com/app/3083300/allnews/)：`Shift+click`、教程文字调整、后续作品“新可选高级推理”。
6. [游戏官网嵌入的官方玩法预告片](https://www.youtube.com/watch?v=GOdcBtby5QM)：原版 UI、区域与 Hint 按钮的视觉证据。
7. [Steam 官方截图示例一](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3083300/ss_0bc8e7f5227b1f016f9b6f3cbedbb275d6400573.1920x1080.jpg?t=1763461008)；[示例二](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3083300/ss_e18d0fcc2cbc52d2189f5596bda07a3923c58cec.1920x1080.jpg?t=1763461008)：数字、双色格、区域边界与 UI。

### 独立实玩观察（用于佐证，不冒充官方规则）

1. [The Geekly Grind：《Proverbs》评测](https://www.thegeeklygrind.com/all-posts/proverbs-review)：Hint 聚焦一个可解 3×3、完成线索的视觉变化。
2. [The Gaming Outsider：《Proverbs》PC 评测](https://thegamingoutsider.com/2024/12/16/proverbs-pc-review/mszymanski/)：中心计入九格、0/9 示例、左右键语义。
3. [ChattySami：《Proverbs》实玩短评](https://chattysami.wordpress.com/2026/08/23/little-inferno-glass-masquerade-proverbs/)：左右键亮/暗语义。
4. [Steam 玩家评测：区域边缘是谜题边界](https://steamcommunity.com/id/Razorflamekun/recommended/3083300/)：跨区不计的独立观察。
5. [Steam 讨论：“0 isn't 0?”](https://steamcommunity.com/app/3083300/discussions/0/666114913574397957/)：玩家对区域裁剪的实际误解及社区解释。

## 最终判定

当前项目的**计数对象、中心格、区域裁剪、0–9 和双色状态基本已对齐原版**。最需要整改的是 Hint 合同：原版证据指向“在当前聚焦区域定位一个可直接解的单线索 3×3”，当前实现却能跨全图选择、直接宣判目标格并升级到两线索差集证明。后者可以作为额外高级功能，但不应继续冒充原版的“给我一个必然步骤”。
