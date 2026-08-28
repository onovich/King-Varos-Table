# 《Proverbs》、创意扫雷变体与“有内容的超大扫雷”市场调研

> 调研截止：2026-07-31  
> 口径：优先使用游戏官网、开发者访谈、Steam / Nintendo / itch.io / App Store 官方页面、官方规则史与代码仓库。  
> 重要区分：本文把“已证实”“开发者自述”“未检出但无法证明不存在”分开表述；待发售作品只按设计承诺列入观察，不当作成品评价。

## 结论先行

1. **《Proverbs》的核心规则不是独创。**它属于已有约二十多年商业史的 **Fill-a-Pix / Mosaic**：格内数字表示其周围最多 3×3、且包含数字格自身的范围中，有多少格应被涂亮。Conceptis 至少在 2003 年已正式推出该品类，构思可追溯到 Trevor Truran 在 1970 年代末开始制作的原型。
2. **它也不是真正把 Nonogram 与 Minesweeper 两套规则合并。**它没有 Nonogram 的行、列连续色块长度提示。更准确的描述是：**扫雷式局部计数 + 数织式涂格成画体验**。若要看真正的规则级“数织 + 扫雷”，应看《Polimines》系列。
3. **“单张数万格画布、分区完成、逐步揭画”也不是《Proverbs》首次实现。**同一开发者 Mark Ffrench 的《Mega Mosaic》已于 2024-05-02 先发布，规格为 250×250、62,500 格，甚至大于《Proverbs》的 54,488 格。
4. **《Proverbs》的独到之处在组合与编排，而不是基础机制发明。**它把 259 个无隔墙、不规则、自封闭的逻辑区域，与老勃鲁盖尔 1559 年《尼德兰箴言》、区域画面、谚语解释、成就和数十小时的长线工程绑成一个整体。本次没有检出早于它、整套组合完全相同的产品，但这不能等价为“世界首创”。
5. 创意扫雷已经形成三条成熟路线：**扩充线索语言**、**把雷变成怪物/资源/行动对象**、**更换棋盘拓扑或社会结构**。真正优秀的变体通常同时改变两层，而不是只换六角格、只加经验值或只把盘面放大。
6. “有趣的超大画幅扫雷”确实存在，但数量很少。最接近《Proverbs》的仍主要是同一开发者的 Mega Mosaic 系列；其他强样本把规模转化为**世界探索、区域版图、多人领土、递归空间或案件档案**。市场上仍明显缺少“单张巨大作者型世界 + 多区域规则 + 宏观叙事/生态”的成熟代表作。

---

## 一、《Proverbs》到底怎样玩

### 1. 基本身份与规模

《Proverbs》由 Mark Ffrench / Divide The Plunder 开发，于 2024-11-07 在 Steam 正式发行。官方规格是：

- 一张 54,000+ 格的连续巨型谜题；官方预告片 UI 可核验为 **54,488 格**；
- **259 个**不规则区域；
- 以 Pieter Bruegel the Elder 1559 年《尼德兰箴言》为整幅画面的主题；
- 完成区域会揭示画面片段、谚语和解释，整盘完成是最终胜利条件。

来源：[Steam 官方页](https://store.steampowered.com/app/3083300/Proverbs/)、[游戏官网](https://www.proverbsgame.com/)、[官方预告片](https://www.youtube.com/watch?v=GOdcBtby5QM)。

### 2. 单格规则

玩家要把未判定的格子标成两种状态：亮 / true 或暗 / false。

格内的数字为 0–9，含义是：

> 以数字格为中心、最多 3×3 的有效邻域中，最终应为“亮”的格子总数；数字格自身也计入。

因此：

- 9 表示完整 3×3 九格全亮；
- 0 表示这个有效邻域内没有亮格；
- 边界处只计算实际存在且属于当前区域的格；
- 中间数字通常通过多个 3×3 范围的重叠、相减与剩余容量来推导。

玩家不是像经典扫雷那样先点击安全格、再读取新出现的数字；线索从一开始就在盘面上，目标是为全部格子完成二值赋值。

### 3. 分区是它最重要的结构改造

整张画被拆成 259 个不规则区域，每个区域都是独立、自封闭、由求解器验证可纯逻辑解出的谜题。玩家可以自由跳区，不必从左上角一路扫到右下角。

这比“在巨大盘面上画几条装饰边框”更重要：

- 长达数十小时的工程可以被切成可完成的小目标；
- 每个区域能独立提供起手线索与完成反馈；
- 局部完成不会被远处尚未解决的约束卡死；
- 区域轮廓可以对应画中人物、动作和谚语主题。

开发者在访谈中解释，《Mega Mosaic》靠粗边框分隔矩形/子区域；到了《Proverbs》，他去掉隔墙，并把每个不规则区设计为独立谜题。[开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)。

### 4. 解出的黑白答案，不等于最终彩色画

传统 Fill-a-Pix 往往让正确涂黑的格子本身组成隐藏图片。《Proverbs》有所不同：

- 底层二值答案是用于逻辑求解的随机式黑白图案；
- 区域完全解对后，游戏才揭示另一层彩色像素画；
- 因此复杂历史画作不必被强行压成可辨认的黑白逻辑答案。

这使“谜题可解性”和“最终美术可读性”解耦，也是它能承载复杂名画的重要产品设计。

### 5. 它与经典扫雷、数织的准确关系

| 类型 | 线索在哪里 | 线索表示什么 | 最终目标 |
|---|---|---|---|
| 经典 Minesweeper | 翻开的安全格内 | 周围八格中的雷数 | 找出所有雷，通常不成画 |
| Nonogram / Picross | 网格外的每行、每列 | 连续填色段的长度与顺序 | 填色格直接组成图片 |
| Fill-a-Pix / Mosaic | 网格内部 | 以该格为中心的 3×3 中填色格数，计入自身 | 通常形成黑白图片 |
| 《Proverbs》 | 网格内部 | 同 Fill-a-Pix / Mosaic | 解完区域后另行揭示彩色名画、谚语和解释 |

因此，称它为“扫雷 + 数织”作为玩家直觉没有问题；做机制史和原创性判断时，则应归类为 **主题化、巨幅化的 Fill-a-Pix / Mosaic**。

---

## 二、它有同类吗？是独创的吗？

### 1. 可核验的历史谱系

| 时间 | 作品 / 事件 | 对原创性判断的意义 |
|---|---|---|
| 1970 年代末—2001 | Trevor Truran 发展邻域计数、0–9 和成画原型 | 核心思想源头 |
| 2003-02 | Conceptis 正式推出 Fill-a-Pix | 证明同一核心规则至少早 21 年商业化 |
| 2017 | Conceptis 推出 60×100、6,000 格的纸质 Mega Mosaik | 大画幅 Fill-a-Pix 也非新概念 |
| 2017–2018 | 《Fill-a-Pix: Phil's Epic Adventure》登陆主机，支持滚动大图 | 数字平台的滚动画布与揭图已有商业先例 |
| 2021-04 | Simon Tatham's Portable Puzzle Collection 加入 Mosaic | 开发者明确承认的直接灵感来源 |
| 2024-05-02 | 《Mega Mosaic》发行：250×250、62,500 格 | 比《Proverbs》更早实现单张巨幅、分区和揭画 |
| 2024-11-07 | 《Proverbs》发行 | 加入不规则自封闭区域和完整名画/谚语内容结构 |
| 2025 以后 | 《Mosaic of Signs》等主题化巨幅同类出现 | 说明“巨幅 Mosaic + 知识/主题揭示”已成为可复用子类型 |

核心一手来源：

- [Conceptis：Fill-a-Pix 规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)
- [Conceptis：Fill-a-Pix 历史](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/history)
- [Simon Tatham：Mosaic 官方手册](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mosaic.html)
- [《Mega Mosaic》Steam 官方页](https://store.steampowered.com/app/2915950/Mega_Mosaic/)
- [开发者 Mark Ffrench 访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)

Mark Ffrench 在访谈中明确表示，他玩过 Simon Tatham 的 Mosaic，想把最大约 50×50 的体验放大成可玩数周的工程，并直言自己**不主张拥有所使用的谜题机制**。这使“《Proverbs》发明了这套玩法”的强主张可以直接排除。

### 2. 最接近的同类

#### 核心规则完全同源

- **Conceptis Fill-a-Pix**：该品类的标准商业产品线，包含普通、Advanced、Mega 等题型。[规则与产品页](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix)
- **Simon Tatham's Mosaic**：免费、参数化、可持续生成，是《Proverbs》开发者承认的直接灵感。[官方手册](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mosaic.html)
- **Picture Sweep**：移动解谜合集 Puzzle Page 中的同规则题型，数字同样统计包含自身的 3×3，并最终揭图。[官方帮助](https://appynation.helpshift.com/hc/en/13-puzzle-page/faq/287-picture-sweep/)
- **Fill-a-Pix: Phil's Epic Adventure**：把 Fill-a-Pix 做成主机上的大型滚动拼图。[任天堂官方页](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-download-software/Fill-a-Pix-Phil-s-Epic-Adventure-1397444.html)
- **Mega Mosaic**：血缘最近的前作；单张 62,500 格、分区完成后揭示像素画。[Steam 官方页](https://store.steampowered.com/app/2915950/Mega_Mosaic/)
- **Mosaic of Signs**：较晚出现的 37,000+ 格移动端同类，把星空、星座和神话知识绑定到巨幅 Mosaic；它晚于《Proverbs》，不能作为前置先例。[Google Play 官方页](https://play.google.com/store/apps/details?id=com.juvelop.mosaicofsigns)

#### 真正把 Nonogram 与 Minesweeper 规则耦合的作品

- **Polimines / Polimines 2**：在同一批异形棋盘中同时使用数织式行段约束与扫雷式邻域约束，两套系统会互相提供信息；两作均为手工、无猜谜题。[第一作](https://store.steampowered.com/app/1892790/Polimines/)、[第二作](https://store.steampowered.com/app/2328730/Polimines_2/)

这组比较说明：《Proverbs》的营销类比很贴切，但若用户想找“真正的数织 + 扫雷规则融合”，《Polimines》比《Proverbs》更准确。

### 3. 原创性逐项判定

| 维度 | 判定 |
|---|---|
| 3×3 邻域、0–9、包含自身 | **明确非原创** |
| 二值填格、纯逻辑推导 | **明确非原创** |
| 填格后揭示图片 | **明确非原创** |
| 大尺寸滚动画布 | **明确非原创** |
| 单张数万格、分区完成 | **不是《Proverbs》首创**，同作者《Mega Mosaic》更早 |
| 完成区域后另揭彩色图 | **不是《Proverbs》首创**，《Mega Mosaic》已有 |
| 无隔墙、不规则、自封闭区域 | **有明确改造性新意**；本次未检出更早完全同构产品 |
| 历史名画 + 谚语解释 + 区域细节 + 成就 | **高度有辨识度的内容组合** |
| 整套组合是否“世界首创” | **证据不足，不能宣称** |

最严谨的一句话是：

> **《Proverbs》的核心玩法和巨幅单盘都不是首创；它的独特价值是把不规则自封闭区域、整幅历史名画、谚语微百科与长期完成感编排成一个非常完整的作品。**

---

## 三、扫雷有哪些真正有创意的变体？

评价创意扫雷时，最重要的不是“还剩多少雷”，而是它改变了哪一层：

1. **线索语言**：数字到底在统计什么、看多远、是否有方向/区域/连续性。
2. **空间拓扑**：方格八邻域是否仍成立，棋盘是否为任意图、球面、双曲面、四维或递归结构。
3. **行动含义**：点击是否变成移动、战斗、建造、押注或收集证据。
4. **风险制度**：是否保证无猜；若不保证，HP、资源和技能是否让概率决策变得有策略。
5. **宏观结构**：局部推理是否服务于更大的路径、案件、构筑、世界或多人关系。

### A. 扩充线索语言：最适合纯逻辑玩家

| 游戏 | 核心变化 | 为什么值得玩 | 无猜情况 |
|---|---|---|---|
| [14 Minesweeper Variants](https://store.steampowered.com/app/1865060/14/) / [2](https://store.steampowered.com/app/2631960/14_Minesweeper_Variants_2/) | 两作各 14 套规则，含方向、距离、区域、比较关系以及非数字/非整数线索 | 像一套“扫雷规则元素周期表”，最适合系统研究变体 | 官方明确无猜 |
| [Mine of Sight](https://www.kongregate.com/en/games/zblip/mine-of-sight) | 同盘混合不同传感器：视线、孤立、连通等 | 玩家要先理解每种图标问了什么，再交叉约束 | 官方主打无猜 |
| [Bombe](https://store.steampowered.com/app/2262930/Bombe/) | 玩家把已发现的局部推理写成规则，形式验证后永久自动执行 | 从“解一盘”变成“提炼扫雷算法” | 数千个无猜谜题 |
| [Tametsi](https://store.steampowered.com/app/709920/Tametsi/) | 异形铺砖 + 行列/颜色区域总量 + 局部计数 | 信息能跨长距离传播，密度高、手工感强 | 官方明确无猜 |
| [Hexcells Infinite](https://store.steampowered.com/app/304410/Hexcells_Infinite/) | 六角格、跨格直线线索、连续/不连续提示 | 关键不只是六角形，而是局部与全局线索耦合 | 手工关以逻辑为主，生成器有求解筛选 |
| [Patterna](https://store.steampowered.com/app/503860/Patterna/) | 把格子抽象成任意图网络 | 直接暴露扫雷的数学本质：节点、邻接与约束 | 官方明确无猜 |
| [Polimines 1/2](https://store.steampowered.com/app/2328730/Polimines_2/) | Nonogram 行段约束 + Minesweeper 邻域约束 | 两套谜题真正互相喂信息 | 官方明确无猜 |
| [Minesweeper Genius](https://www.nintendo.com/en-ca/store/products/minesweeper-genius-switch/) | 行列总雷数 + 标雷后规划角色到出口的路径 | “知道危险”必须进一步转化为可走路线 | 官方明确无猜 |

### B. 改变空间与拓扑：相邻关系本身成为谜题

| 游戏 | 空间变化 | 趣味来源 |
|---|---|---|
| [Non-Euclidean Minesweeper](https://store.steampowered.com/app/3380320/) | 欧氏与双曲铺砌，专用求解器 | 双曲空间向屏幕边缘急剧扩张，邻域与环结构都改变；官方无猜 |
| [4D Minesweeper](https://store.steampowered.com/app/787980/4D_Minesweeper/) | 真四维网格，一个格最多 80 个邻居；维度可设为周期拓扑 | 迫使玩家在切片、高亮和高维邻接间推理；内置 80+ 无猜盘 |
| [Globesweeper](https://store.steampowered.com/app/982220/Globesweeper/) | 球面 + 六角/三角/方格，最大 20,480 格 | 球面无边角，经典“从角落起手”的经验失效；可选保证可解 |
| [Globesweeper: Hex Puzzler](https://store.steampowered.com/app/1121530/Globesweeper_Hex_Puzzler/) | 有缺口的球体 + Cluster / Area / Group 等多种线索 | 拓扑和线索语言同时变化，强于单纯球面换皮 |
| [Mastermine](https://store.steampowered.com/app/1491530/Mastermine/) | 立方体表面，可用能力重新排列棋盘 | 玩家不仅读取空间，还主动改造约束结构 |
| [InfiniSweeper - Minesweeper With Recursions](https://ataraxia-mechanica.itch.io/infinisweeper) | 棋盘包含自己，递归进入更深层级 | 放大、缩小和判断当前层级本身就是推理 |

### C. Dragonsweeper 所属的“怪物 / RPG 扫雷”谱系

`Dragonsweeper` 很有创意，但“怪物有等级、邻域数字表示战力、通过战斗升级再处理更强敌人”并不是孤立出现的点子。

- **Mamono Sweeper**（约 2010）：数字表示邻近怪物的**等级总和**；玩家与怪物战斗，击杀得经验并升级，较强怪物会反击。它已经建立了“线索数值同时是空间信息和战斗信息”的核心闭环。[开发者官方页](https://hojamaka.com/games/mamono_sweeper)
- **Dragonsweeper**：把这条路线做成更现代、角色更鲜明的单盘冒险，并加入观察、图鉴与龙的终局目标。[官方 itch.io 页](https://danielben.itch.io/dragonsweeper)。现有 credits 资料也明确把 Mamono Sweeper 列为灵感来源，[存档资料](https://www.mobygames.com/game/252107/dragonsweeper/credits/)。
- **Cavern Sweeper**（2022）：不同怪物拥有不同影响形状，玩家要借助图鉴判断“是哪种怪物在怎样影响线索”，不再只是统一邻域里的等级总和。[开发者页](https://hempuli.itch.io/cavern-sweeper)
- **Mamono Mower**（2022）：把同一谱系改造成角色移动、割草和越级 dash 的空间执行游戏。[开发者页](https://hempuli.itch.io/mamono-mower)

结论是：**Dragonsweeper 不是“扫雷 + RPG”这一大类的首创；它的价值在于把已有谱系压缩成节奏清晰、视觉鲜明、规则易读的一次完整冒险。**

### D. 把扫雷嵌入战斗、构筑、实时与叙事

| 游戏 | 第二层玩法 | 它真正改变了什么 |
|---|---|---|
| [DemonCrawl](https://store.steampowered.com/app/1141220/DemonCrawl/) | Roguelite、1,000+ 物品、职业、modifier、合成、无尽和 PvP | 道具直接改写揭格、标记、经济和局部规则；不是纯无猜逻辑题 |
| [Let’s! Revolution!](https://store.steampowered.com/app/2111090/Lets_Revolution/) | 程序迷宫、回合移动、技能、职业、Boss | 扫雷推断用于追踪敌人和寻找道路，而非清完整盘 |
| [Defense of the Oasis](https://store.steampowered.com/app/45200/Defense_of_the_Oasis/) | 探索、修路、研究、城市与蛮族进攻 | 早在 2005 年就把扫雷式探索嵌入轻量文明经营 |
| [Tetrisweeper](https://kertisjones.itch.io/tetrisweeper) | 下落方块 + 实时扫雷；填满且解对一行才消除 | 玩家一边造棋盘一边解棋盘，并能通过摆放减少未来猜测 |
| [ClueSweeper](https://www.kongregate.com/en/games/nerdook/cluesweeper) | 谋杀案、证据、嫌疑人推理 | 局部揭格用于收集上层案件信息，是早期叙事扫雷范例 |
| [Minesweeper: Collector](https://store.steampowered.com/app/1375930/Minesweeper_Collector/) | 长篇关卡、收藏、宝箱、物品、任务和宠物 | 把每盘推进变成收集型长线旅程，支持方格与六角格 |
| [Dungeon Divers](https://store.steampowered.com/app/1844790/Dungeon_Divers/) | 程序地牢、不同房间规则、有限尝试和遗物 | 每间房用不同条件重释“安全/危险”，局部规则服务于地牢推进 |
| [Coinsweeper](https://store.steampowered.com/app/4321130/Coinsweeper/) | 随时 cash out、商店、强化和局外成长 | 把踩雷改成“本轮收益是否及时落袋”的风险经营；2026 新作，样本尚小 |
| [BroomSweeper](https://store.steampowered.com/app/3473250/BroomSweeper/) | 角色、道具、状态污染、Boss 与 ascension | 值得关注之处是危险材料会修改格子和数字，而非只加 HP |
| [Minesweeper Together](https://store.steampowered.com/app/3550060/Minesweeper_Together/) | 最多 8 人合作/对抗、绘图沟通、Workshop | 规则变化不大，但把推理变成分工、沟通和竞速问题 |

### 4. 怎样判断一个变体是“真创新”还是“外挂系统”

较弱的设计通常只改一层：

- 方格换六角格，但推理模式没变；
- 加经验值，但成长只等于多一次失误机会；
- 加卡牌，但卡牌与线索无关；
- 把棋盘扩大，却没有宏观目标。

较强的设计会让两层互相反馈：

- **Mamono Sweeper**：线索数值含义 ↔ 战斗成长；
- **Minesweeper Genius**：行列约束 ↔ 路径执行；
- **Tetrisweeper**：实时落块 ↔ 玩家主动塑造未来约束；
- **Bombe**：局部推理 ↔ 算法自动化元进度；
- **ClueSweeper**：揭格证据 ↔ 上层身份推理；
- **Proverbs**：区域逻辑 ↔ 巨幅文化内容与长期完成感。

另一个关键分界是**是否无猜**：

- 纯逻辑作品若自称逻辑题，50/50 会破坏公平感；
- RPG / Roguelite 作品可以保留不确定性，但必须提供生命、撤退、资源、技能或局部恢复，使“猜”变成可管理风险，而不是随机惩罚。

---

## 四、有没有“不只是大”的超大画幅扫雷？

### 1. 最符合条件的已发行作品

| 作品 | 规模 | 大画幅之外的第二层 | 匹配判断 |
|---|---:|---|---|
| [Mosaic of the Strange](https://store.steampowered.com/app/3444650/Mosaic_of_the_Strange/) | 开发者公告称 100,000+ 格、多地点互锁 | FBI 谋杀案、点击冒险、角色对话、144 份超自然档案、多难度与高级推理 | **目前最接近“Proverbs 公式升级版”** |
| [Mosaic of The Pharaohs](https://store.steampowered.com/app/3530670/Mosaic_of_The_Pharaohs/) | 60,000+ 格 | 古埃及巨幅拼贴 + 近 100 条神话、诸神、建筑和探险知识 | **强：图像 + 知识** |
| [2024 Mosaic Retrospective](https://store.steampowered.com/app/3380760/2024_Mosaic_Retrospective/) / [2025](https://store.steampowered.com/app/4266120/2025_Mosaic_Retrospective/) | 约 60,000 / 57,600 格 | 把全年新闻、体育、气候和流行文化拼成免费视觉年鉴 | **强：巨幅时间胶囊** |
| [Mega Mosaic](https://store.steampowered.com/app/2915950/Mega_Mosaic/) | 250×250 = 62,500 格 | 分区揭像素画、90+ 成就 | **强，但内容层不如后作** |
| [Dungeon Sweeper](https://setamopixel.itch.io/dungeon-sweeper) | 世界持续向外扩张 | 生态区、怪物、地下城定位、事件感与图鉴方向 | **强：规模变成探索世界** |
| [Infinite Minesweeper（GRYKUBY）](https://www.grykuby.com/) | 无限、由互联 8×8 区域组成 | 雾区、失陷区域、包围收复、难度递增、特殊区域、任务/经验 | **强：规模变成版图状态** |
| [InfiniSweeper - Recursions](https://ataraxia-mechanica.itch.io/infinisweeper) | 递归无限，而非平铺百万格 | 棋盘包含自身，跨层邻接与缩放成为规则 | **强：规模本身改变思考方式** |
| [A Few Billion Square Tiles](https://apps.apple.com/us/app/a-few-billion-square-tiles/id872570180) | 所有人共用无限棋盘 | 帝国、氏族、聊天、排行榜、隐藏/玩家绘制像素画 | **强概念；需先验证服务器仍可用** |

`Mosaic of the Strange` 的开发者公告明确写过“超过 100,000 格、接近《Proverbs》的两倍、多个互联地点”；当前商店页还列出档案、案件和点击冒险结构。[官方公告聚合页](https://steamcommunity.com/app/3083300/allnews/)。

### 2. 有意义，但与《Proverbs》不是同一种“大”

| 作品 | 规模的意义 | 限制 |
|---|---|---|
| [WorldSweeper](https://worldsweeper.app/) | 整个世界地图成为共享雷区，开格揭示真实地形 | 主题和社交有意义，但额外系统较轻 |
| [Globesweeper](https://store.steampowered.com/app/982220/Globesweeper/) | 最大 20,480 格，球面无边角且有多种铺砌 | 拓扑有价值，但没有叙事、区域事件或整体揭画 |
| [Minesweeper Collector 2](https://store.steampowered.com/app/2671210/Minesweeper_Collector_2/) | 300+ 关、大型符文雷关、角色图、制作、钓鱼和剧情 | 是内容庞大的长篇关卡集，不是单张连续巨画 |
| [Let’s Minesweeper](https://store.steampowered.com/app/2865580/Lets_Minesweeper/) | 4,800 万格、1,000 万+ 雷、多人共同清理和署名旗帜 | 社会纪念工程有趣，局部规则仍近似原版 |
| [m3o](https://m3o.io/) | 永不耗尽的共享盘，永久留下旗帜和已开格 | 有考古/协作感，但没有世界生态、剧情或新线索 |

### 3. 值得观察、但截至调研日尚未正式发行

- **Dungeon Sweeper Plus**：计划把原型扩展成拥有多生态区、事件、金币、旗帜、不同地下城和百科的长期世界；截至 2026-07-31 仍为 2026 待发售。[PLAYISM 官方页](https://playism.com/en/game/dungeon-sweeper-plus/)、[Steam](https://store.steampowered.com/app/4562750/Dungeon_Sweeper_Plus/)
- **Grid Lands**：共享持久世界中，安全格成为领土；还有回收经济、炮塔、地堡、护盾、PvE 营地、PvP 和世界地图。概念上是“无限扫雷 + 领土 MMO / 轻 RTS”，但截至 2026-07-31 仍标为 Q3 2026，不能按成品评价。[Steam 官方页](https://store.steampowered.com/app/4677750/Grid_Lands/)

### 4. 哪些只是“大”，不满足问题标准

以下产品可以证明大盘/无限盘技术很常见，却不能证明规模本身有趣：

- **MassiveSweeper**：800×600、48 万格、实时多人，但额外玩法主要就是共同清盘。[itch.io](https://guyginat.itch.io/massivesweeper)
- **Minesweeper: Unlimited Expansion**：每通关一次棋盘面积翻倍，没有披露新的世界内容、区域机制或宏观目标。[Steam](https://store.steampowered.com/app/4656380/Minesweeper_Unlimited_Expansion/)
- 各类纯 Infinite Minesweeper：无边界、无终点、只比最高分；如果没有区域、生态、社会结构、构筑或内容揭示，本质仍是没有终点的原版扫雷。

这正好回应了问题中的判断标准：**几千万格并不自动比几百格有趣；只有当格子被重新解释成画作、档案、世界地块、领土、生态区或递归入口时，规模才成为玩法。**

---

## 五、实际推荐顺序

### 如果最喜欢《Proverbs》的“漫长完成一件作品”

1. **Mosaic of the Strange**：同一公式最完整、最叙事化的升级。
2. **Mosaic of The Pharaohs**：巨画 + 知识收集。
3. **2024 / 2025 Mosaic Retrospective**：免费，像做一份年度视觉档案。
4. **Mega Mosaic**：看这条产品谱系在《Proverbs》之前的原型。

### 如果想看最聪明的纯规则创新

1. **14 Minesweeper Variants 2**
2. **Bombe**
3. **Tametsi**
4. **Mine of Sight**
5. **Polimines 2**
6. **Non-Euclidean Minesweeper**

### 如果喜欢 Dragonsweeper 的战斗与冒险

1. **Mamono Sweeper**：先看这条谱系的早期核心。
2. **Let’s! Revolution!**
3. **DemonCrawl**
4. **Defense of the Oasis**
5. **Cavern Sweeper**

### 如果想看“规模本身变成规则”

1. **InfiniSweeper - Minesweeper With Recursions**
2. **Dungeon Sweeper**
3. **Infinite Minesweeper（GRYKUBY）**
4. **Globesweeper**
5. 观察 **Dungeon Sweeper Plus** 与 **Grid Lands**

### 只挑八个最能覆盖整个设计空间

1. 《Mosaic of the Strange》
2. 《14 Minesweeper Variants 2》
3. 《Bombe》
4. 《Tametsi》
5. 《Mamono Sweeper》
6. 《Tetrisweeper》
7. 《Let’s! Revolution!》
8. 《InfiniSweeper - Minesweeper With Recursions》

---

## 六、市场空白与设计启示

现有市场已经充分证明：

- 局部扫雷规则可以扩展得非常深；
- RPG、Roguelite、实时、路径与多人混搭都有人做；
- 数万到数千万格的盘面并不稀罕；
- 主题化巨幅 Mosaic 已由 Mark Ffrench 做成一个小系列。

但仍明显稀缺的是：

> **一张长期存在、作者精心编排的巨型世界；不同区域拥有不同线索语义、生态和故事；局部完成会改变全局通路、角色关系、可见信息或世界状态；同时保留无猜逻辑或战略性恢复。**

要让超大扫雷不退化成耐力劳动，至少需要其中几项：

1. 整张图最终是可读对象：名画、世界、年鉴、案件墙或历史地图。
2. 区域完成会解锁内容，而不是只增加百分比。
3. 不同地区改变规则、密度、敌人、线索或工具。
4. 有宏观导航：全图缩放、小地图、书签、区域状态和快速跳转。
5. 长局采用分区容错，不让一次误触抹掉几十小时。
6. 多人留下持久痕迹：领土、署名、建筑、作品或历史。
7. 后期规模由构筑、技能链或跨区目标消化，而不是增加重复点击。

这也是为什么《Proverbs》虽不属于机制首创，仍然显得新鲜：它准确抓住了大多数“大扫雷”没有解决的问题——**让每一块局部推理都成为完成一件有意义的整体作品的进度。**

## 检索边界

本报告足以高置信度否定两项强主张：“《Proverbs》发明了 3×3 计数规则”“《Proverbs》第一次把它做成单张巨型画布”。但公开网络无法穷尽早期纸质谜题、已下架移动应用、小语种作品和未公开原型，因此“未找到更早完全相同组合”不能包装成世界首创证明。
