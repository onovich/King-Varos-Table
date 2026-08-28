# 扫雷起源与 Trevor Truran / Fill-a-Pix 关系考据

日期：2026-08-28  
范围：调查扫雷的历史谱系，以及 Trevor Truran 的 `Bang To Rights` 是否构成 Microsoft Minesweeper 的来源；并依据当前项目源码核对两套规则的本质差异。  
结论口径：区分“原始作品事实”“作者回忆”“后世归因”；没有作者或原始资料支持时，不画直接继承箭头。

## 结论先行

1. **目前没有证据表明扫雷源自 Trevor Truran。**
   
   Truran 在 2003 年回顾文章中说，自己在 1980 年代初独立构思了 `Bang To Rights`：数字帮助判断雷的位置，目标是找出一条唯一安全路径。他明确将其称为独立创作，但没有声称 Curt Johnson、Robert Donner 或 Microsoft 接触过这款谜题，也没有提供能够证明传播到 Microsoft 的材料。[Trevor Truran 自述](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156)

2. **`Bang To Rights` 应视为早期独立类似物，而不是已经证明的扫雷祖先。**
   
   它与早期路径型雷区游戏高度相似，但“年代接近、规则相似”不等于“存在继承”。Truran 的文章是一手作者自述，可以证明他如何描述自己的创作；由于目前未取得 1980 年代的原始刊物、题纸或发行记录，它不能单独证明精确首创日期或影响范围。

3. **Microsoft Minesweeper 的可靠开发链是：一款未具名早期游戏 → Curt Johnson 的 OS/2 版本 → Robert Donner 的 Windows 重做。**
   
   Donner 在 Microsoft Alumni Network 的口述史中回忆：Curt Johnson 在 OS/2 Presentation Manager 上移植过一款“从棋盘一角穿过隐藏雷区到另一角”的游戏；Donner索取了代码，但称自己只使用了位图素材，随后在一个周末基本重新写成 Windows 游戏。试玩者 Dave 更想找出所有雷，而不是只找一条路径，于是 Donner 把胜利目标改成清查整盘，并逐步加入右键标雷、难度、计时等现代 Minesweeper 特征。[Robert Donner 口述史，PDF 第 3–12 页](https://www.microsoftalumnivoices.com/_files/ugd/ff6e33_03f6b545fb594b43982821c4c530dcd9.pdf)

4. **Curt Johnson 所依据的更早游戏名称仍未可靠确定。**
   
   2014 年 Eurogamer 对 Curt Johnson 的采访被后续报道转述为：Johnson 承认借鉴过另一款游戏，但明确表示不是 Ian Andrew 的 `Mined-Out`，并已记不起名称。由于本次未能直接读取 Eurogamer 原文，只能把这一点列为**二手转引的第一人称说法**，不能据此认定那款未知游戏就是 `Relentless Logic`。[SRF 对 Eurogamer 采访的同期转述](https://www.srf.ch/radio-srf-3/digital-am-sonntag-digital-am-sonntag-nr-72-minesweeper)

5. **1983 年的 `Mined-Out` 与约 1985 年的 `Relentless Logic` 都可靠地早于 Microsoft 版本，但没有足够证据证明直接传承。**
   
   它们应写成“已证实的早期同类／前身候选”，而不是未经限定地写成 `Mined-Out → Relentless Logic → Microsoft Minesweeper`。

## 可可靠使用的历史谱系

```text
Trevor Truran：Bang To Rights（1980 年代初，作者回忆）
    └─ 独立的路径型雷区逻辑谜题；未证实影响 Microsoft

Ian Andrew：Mined-Out（1983，商业发行）
    └─ 路径型雷区电子游戏；未证实被 Microsoft 直接采用

Conway / Hong / Smith：Relentless Logic（通常记为约 1985）
    └─ 路径型、八邻域计数的 DOS 游戏；未证实是 Curt Johnson 的来源

未具名的更早游戏
    ↓ Robert Donner 明确回忆 Curt Johnson 曾“移植”它
Curt Johnson：OS/2 Presentation Manager 雷区路径游戏（1980 年代末）
    ↓ Robert Donner 取得代码，但称只沿用了位图素材并重写 Windows 版本
Robert Donner：Mine / Winmine / Minesweeper（约 1989–1990）
    ↓
Microsoft Entertainment Pack 1（1990，首次商业发行）
    ↓
Windows 3.1（1992，首次作为 Windows 标配游戏广泛传播）
```

上图只有 **Curt Johnson OS/2 版本 → Robert Donner Windows 版本** 是有 Microsoft 作者本人明确说明的直接开发链。其余早期作品与 Microsoft 版本之间均不应画未经限定的继承箭头。

## 分项事实与证据评估

### 1. Trevor Truran 与 Bang To Rights

Truran 在 2003 年文章中回忆：

- 他在 1970 年代末开始设计以“格子及其邻居”为基础的 internal-referencing 谜题；
- 后来把这套结构用于迷宫目标，主要原型是 `Bog Hopping` 和 `Bang To Rights`；
- 在 `Bang To Rights` 中，棋盘是雷区，数字帮助判断雷的位置，玩家据此找出唯一安全路径；
- 他把它描述为 1980 年代初、早于 PC 免费 Minesweeper 普及的独立创作。[Trevor Truran 自述](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156)

证据判断：

- **A级：** Truran 确实在 2003 年作出了上述第一人称声明。
- **B/C级：** `Bang To Rights` 的精确创作日期、是否公开发表、传播范围和世界优先权。目前只有回顾性自述，缺少同期实物或出版记录交叉验证。
- **无证据：** Johnson、Donner 或 Microsoft 曾看到、使用或引用 `Bang To Rights`。

因此最严谨的表述是：

> `Bang To Rights` 是 Truran 独立构思的早期“数字雷区 + 安全路径”类似物；目前不能把它写成 Microsoft Minesweeper 的来源。

### 2. Mined-Out（Ian Andrew，1983）

可确认事实：

- Ian Andrew 的作者页面把 `Mined-Out` 记为 1983 年由 Quicksilva 在 ZX Spectrum 上发行，目标是跨越多层雷区并最终营救 Bill the Worm。[Ian Andrew 作者页面](https://www.ianandrew.com/mined-out)
- 1983 年 4 月的 *Computer and Video Games* 当期资料已宣传该作：玩家要穿过埋雷场，拥有探雷器，边缘有安全区域；这属于同期发行证据。[CVG 1983 年 4 月原刊扫描](https://retrocdn.net/images/8/86/CVG_UK_018.pdf)
- World of Spectrum 保存了 1983 年原始磁带镜像、说明文本和封面资料，支持发行年份与作品身份。[World of Spectrum 档案](https://worldofspectrum.net/item/0003213/)

玩法上，它要求玩家实际移动角色穿越雷区；保存资料与后来的档案说明显示，探雷器报告当前位置四个正交邻格中的雷数，而不是现代 Minesweeper 对任意已翻安全格显示八邻域数字。该“仅四方向”细节主要依赖档案说明和后世整理，证据强度低于发行年份本身。

与 Microsoft 版本的关系：

- **高可信：** `Mined-Out` 在时间上早于 Microsoft 版本。
- **中等可信：** 它是规则史上重要的早期同类，已经具有隐藏雷区、邻近数量提示与路径目标。
- **未证实：** Microsoft 作者直接采用它。
- **反向保留意见：** Curt Johnson 据二手转引明确说自己借鉴的并不是 `Mined-Out`；Ian Andrew 后来认为 Microsoft 可能复制其构想，这只是双方不同的回忆或判断，不能单独证明传承或抄袭。

### 3. Relentless Logic / RLogic（约 1985）

本次下载并检查了档案站保存的 `RLOGIC.EXE`：

- 文件内部署名为 Conway、Hong、Smith；
- 说明文字让玩家扮演美国海军陆战队士兵，从左上角前往右下角 Command Center；
- 探雷器报告当前位置周围方格中的雷数；
- 目标是安全到达终点，而不是揭开全部安全格或标出全部雷。

档案来源：[My Abandonware 的 Relentless Logic 下载页](https://www.myabandonware.com/game/relentless-logic-283)  
本次检查文件 SHA-256：`4BCE551B9BE1D3AC26AB40CC7A6CAE3380445A237D91C792B9540D05B32B25E9`

年代判断需要保留：

- MobyGames、My Abandonware 等多个游戏档案把它标为 1985 年；[MobyGames 条目](https://www.mobygames.com/game/42299/relentless-logic/)
- 本次取得的可执行文件自身时间戳为 1987-01-20，内部未发现 1985 年版权字符串；
- 1987 年 4–5 月的 *Morrow Owners' Review* 已把另一款游戏明确写成受 `RLOGIC` 启发，证明它最迟在 1987 年已流通，但不足以独立坐实 1985 的具体日期。[同期杂志扫描](https://www.bitsavers.org/pdf/morrow/morrow_owners_review/MORv4n2_AprMay1987.pdf)

因此报告采用“**通常记为约 1985，最迟 1987 已有同期流通证据**”。

与 Microsoft 版本的关系：

- 其矩形棋盘、八邻域探测和角到角路径目标，与 Donner 描述的 Curt Johnson OS/2 版本非常接近；
- 但 Donner 没有说 Curt 的来源叫 `Relentless Logic`，Curt 的已知转述也说自己忘记了来源名称；
- 所以只能说它是**非常接近的早期前身候选**，不能说已证明 Curt Johnson 移植的就是它。

### 4. Microsoft Minesweeper 的作者链

Robert Donner 的 2023 年口述史是当前最强的一手证据：

1. 1989 年加入 Microsoft 后，他为了学习 Windows GUI 和鼠标编程寻找小项目；
2. 同事 Curt Johnson 正在 OS/2 Presentation Manager 相关工作上，并移植过一款穿越隐藏雷区的路径游戏；
3. Donner 向 Curt 要了代码，但称只用了其中的位图素材，Windows 程序基本由自己在周末完成；
4. 初版仍保留路径目标，试玩者 Dave 更关注找出所有雷，促使 Donner 改成整盘排雷目标；
5. 后续加入右键标雷、难度、计时和快速周边操作等特征；
6. 游戏先在 Microsoft 内部传播，后由产品团队收入 Microsoft Entertainment Pack；Donner 还回忆，自己并未参与把它加入 Windows 的决定。[Robert Donner 口述史](https://www.microsoftalumnivoices.com/_files/ugd/ff6e33_03f6b545fb594b43982821c4c530dcd9.pdf)

公开发行节点：

- **1990：** 作为 Microsoft Entertainment Pack 1 的组成部分首次商业发行；
- **1992：** 随 Windows 3.1 标配，成为大众熟知版本。

Microsoft 内部经历和首次 Entertainment Pack 发行也由 Donner、当时产品人员的回忆互相印证。[Microsoft 早期游戏史整理，含 Donner 第一人称回忆](https://www.shacknews.com/article/120300/bet-on-black-how-microsoft-and-xbox-changed-pop-culture?page=4)

### 5. 更早候选：Cube、Minefield 等

后世文章还会把 Jerimac Ratliff 的 `Cube`（常记为 1973）或 1982 年的 `Minefield` 列为更早祖先候选。本次没有取得足以核验其原始代码、完整规则、作者说明及对后续作品影响关系的一手材料，因此：

- 不把它们纳入可靠的直接谱系；
- 只承认“隐藏危险、在网格中导航”的思想早于 1983；
- 不据此声称现代 Minesweeper 已在 1970 年代完整形成。

## 证据等级总表

| 主张 | 证据等级 | 判断 |
| --- | --- | --- |
| Truran 说 `Bang To Rights` 是 1980 年代初的独立创作 | A（作者自述） | 可准确转述为“Truran 如此回忆” |
| `Bang To Rights` 直接影响 Microsoft Minesweeper | 无 | 不应主张 |
| `Mined-Out` 于 1983 年由 Quicksilva 发行 | A/B | 作者页、同期杂志、软件档案互证 |
| `Mined-Out` 是 Microsoft 版本的直接来源 | 无／存在相反作者转述 | 只能称早期同类，不能画继承箭头 |
| `Relentless Logic` 由 Conway、Hong、Smith 制作 | A（原始二进制内署名） | 高可信 |
| `Relentless Logic` 的路径与邻域探雷规则 | A（原始二进制说明） | 高可信 |
| `Relentless Logic` 精确发行于 1985 | B/C（后世档案） | 通常记为约 1985；最迟 1987 已流通 |
| `Relentless Logic` 是 Curt Johnson 所移植的未知游戏 | 无直接证据 | 只能称高度相似候选 |
| Curt Johnson 的 OS/2 游戏直接在 Donner 版本之前 | A（Donner 口述） | 高可信 |
| Donner 重写 Windows 版本并把目标改为找出全盘雷 | A（Donner 口述） | 高可信 |
| 1990 Entertainment Pack、1992 Windows 3.1 | A/B | Microsoft 当事人回忆与产品记录一致 |

## 与 Fill-a-Pix / 当前项目的本质差异

两者在最抽象的约束层确实属于近亲：每个格子都对应一个二值变量，数字对局部变量之和施加限制。因此，“0 表示全否”“数字等于未定格数时全是”“重叠范围作差”等推理，在两边都可能出现。

但当前项目源码采用的是 Fill-a-Pix / Mosaic 型定义。对于数字格 `p`：

```text
Σ bright[q] = clue[p]
q ∈（以 p 为中心、经棋盘边缘及同区域边界裁剪的最多 3×3 范围）
```

这里 `p` 本身属于求和范围；带数字的格仍然是待判断的亮／暗变量。对应实现见 `web/puzzle-logic.mjs` 的 `neighboursForCell`、`varos_table/level.py` 的 `neighbours_for_cell` 与 `calculate_clues`。

经典 Minesweeper 对已经翻开的安全数字格 `p` 则是：

```text
mine[p] = 0
Σ mine[q] = clue[p]
q ∈ p 周围八格（不含 p）
```

数字是“安全翻格之后产生的信息”，不是与地雷状态叠在同一格中的预置约束。

| 维度 | 经典 Minesweeper | Fill-a-Pix / 当前项目所属规则家族 |
| --- | --- | --- |
| 线索何时出现 | 翻开安全格后动态出现 | 题目开始时数字线索已经给出 |
| 数字统计范围 | 数字格周围八格中的雷数，**不含数字格自身** | 以数字格为中心的最多 3×3 目标格数，**包含数字格自身** |
| 数字格状态 | 已翻开的数字格必定安全，不再是雷候选 | 带数字的格本身仍是待判断的亮／暗变量 |
| 数字范围 | `0–8` | 完整 3×3 范围为 `0–9`；被棋盘或区域边界裁剪时上限相应降低 |
| 玩家动作 | 冒险翻格；点中雷通常立即失败；可插旗 | 为格子做二值标记，不以“踩雷”作为核心交互 |
| 信息结构 | 线索由玩家探索逐步产生 | 固定线索构成完整约束系统 |
| 边界结构 | 通常只受整张矩形棋盘边缘裁剪 | 当前项目还受大区域边界裁剪，不跨区域计数 |
| 典型目标 | 打开所有安全格／定位雷，随机盘可能需要猜测 | 完成全部二值赋值；优质题通常预先验证唯一、无猜 |
| 失败与胜利 | 翻到雷会失败；通常打开全部安全格即可胜利 | 亮、暗都是普通答案值；完成整盘分类并满足线索 |

因此两者共享的是“局部邻域计数约束”，但不是同一玩法：Minesweeper 是**探索产生线索的风险排雷**；Fill-a-Pix / 当前项目是**线索预置、包含自身、旨在复原整张二值图案的约束填格**。把当前项目称作“扫雷的同一玩法”会同时遗漏中心格语义、信息揭示方式、失败条件、胜利目标和无猜唯一性契约。

## 最终可安全引用的表述

> 没有证据表明 Microsoft Minesweeper 源自 Trevor Truran。Truran 的 `Bang To Rights` 是他自述在 1980 年代初独立构思的路径型雷区谜题，应视为早期平行类似物。现代 Microsoft 版本的可靠作者链是：Curt Johnson 先为 OS/2 移植一款名称已失考的路径型雷区游戏，Robert Donner 随后为 Windows 重写，并把目标从穿越路径改为找出整盘地雷。1983 年的 `Mined-Out` 与约 1985 年的 `Relentless Logic` 都早于 Microsoft 版本，但目前没有足够作者证据证明其中任何一款就是 Johnson 的直接来源。

## 来源表

| 来源 | 类型 | 本报告用途 | 局限 |
| --- | --- | --- | --- |
| [Trevor Truran：《The Path to Fill-a-Pix》](https://www.conceptispuzzles.com/index.aspx?uri=info/article/156) | 作者第一人称，2003 | `Bang To Rights` 规则、独立创作声明 | 回顾性文章，缺少同期实物交叉验证 |
| [Robert Donner：Microsoft Alumni Network 口述史](https://www.microsoftalumnivoices.com/_files/ugd/ff6e33_03f6b545fb594b43982821c4c530dcd9.pdf) | Microsoft 作者第一人称，2023 访谈 | Curt OS/2 → Donner Windows 的直接开发链、玩法目标演变 | 距事件约三十余年，属于回忆材料 |
| [Ian Andrew：Mined-Out 作者页面](https://www.ianandrew.com/mined-out) | 作者页面 | 1983、发行商、目标与作者身份 | 页面明确提醒可能存在回忆误差 |
| [CVG 1983 年 4 月原刊](https://retrocdn.net/images/8/86/CVG_UK_018.pdf) | 同期行业杂志 | 证明 `Mined-Out` 当时已经发行及基本玩法 | 简短新品报道，规则不完整 |
| [World of Spectrum：Mined-Out 档案](https://worldofspectrum.net/item/0003213/) | 保存机构／软件档案 | 原始磁带、说明、封面和发行记录 | 档案元数据由后世整理 |
| [Relentless Logic 下载档案](https://www.myabandonware.com/game/relentless-logic-283) | 原始二进制的后世托管 | 核验内部署名和原始说明文字 | 托管站不是原发行方，1985 元数据未写入二进制 |
| [MobyGames：Relentless Logic](https://www.mobygames.com/game/42299/relentless-logic/) | 游戏档案数据库 | 1985 年份与作者信息的交叉核对 | 后世整理，不证明影响链 |
| [Morrow Owners' Review，1987 年 4–5 月](https://www.bitsavers.org/pdf/morrow/morrow_owners_review/MORv4n2_AprMay1987.pdf) | 同期杂志档案 | 证明 `RLOGIC` 最迟 1987 年已流通并影响其他程序 | 文中作者署名拼写与现存二进制不完全一致 |
| [SRF 对 2014 Eurogamer 采访的转述](https://www.srf.ch/radio-srf-3/digital-am-sonntag-digital-am-sonntag-nr-72-minesweeper) | 二手媒体转引 | Curt 称借鉴对象不是 `Mined-Out`、名称已忘 | 未直接取得 Eurogamer 原文，必须降级 |
| [Shacknews / Bet on Black](https://www.shacknews.com/article/120300/bet-on-black-how-microsoft-and-xbox-changed-pop-culture?page=4) | 历史著作网页章节，含当事人采访 | Entertainment Pack 与 Microsoft 内部传播的交叉验证 | 非原始产品文档 |
