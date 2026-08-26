# 有创意的扫雷变体：机制谱系、代表作品与“无猜”程度

> 调研截止：2026-07-31  
> 范围：不是简单换皮或只把棋盘放大，而是改变扫雷的线索语言、空间拓扑、行动方式、资源系统、叙事结构、多人关系或与其他逻辑题的耦合方式。  
> 来源策略：优先开发者官网、Steam/Nintendo/itch.io 官方商店页、官方仓库；历史作品仅在一手资料不足时使用可信二手资料补日期。

## 一、结论先行

1. **“创意扫雷”不是单一谱系，而是三条主干。**
   - **扩充约束语言**：把“相邻八格有几个雷”扩展为视线、方向、区域、连通性、非整数甚至非数字线索。代表是 *14 Minesweeper Variants*、*Mine of Sight*、*Tametsi*、*hexceed*。
   - **把雷重新解释为角色或资源**：雷变成有等级的怪物、地牢、敌人、素材、卡牌或可自动化处理的对象。代表是 *Mamono Sweeper*、*DemonCrawl*、*Let’s! Revolution!*、*BroomSweeper*。
   - **更换承载扫雷的空间或社会结构**：任意图、四维、非欧几何、球面、下落方块、协作或竞速。代表是 *Patterna*、*4D Minesweeper*、*Non-Euclidean Minesweeper*、*Tetrisweeper*、*Minesweeper Together*。

2. **“是否无猜”是比“像不像扫雷”更重要的设计分界。**
   - 一类作品把扫雷彻底做成可证明的逻辑题，明确保证每关可推导。
   - 另一类作品故意保留随机性，但让生命、装备、技能、路径和构筑承担风险。此时乐趣从“证明唯一答案”转为“在不完全信息下经营风险”。
   - 因此 RPG 化并不天然等于更深的扫雷；关键在于角色系统有没有与线索推理发生双向耦合，而不是只在经典扫雷外包一层升级界面。

3. **用户已知的 Dragonsweeper 所在谱系有清楚前史。**
   - *Mamono Sweeper* 至少在 2010 年已把数字改成邻近怪物等级总和，并引入攻击、反击、HP、经验和升级。
   - 2022 年的 *Cavern Sweeper*、*Mamono Mower* 又分别把“不同怪物具有不同影响形状”和“以角色移动/割草执行扫雷”推得更远。
   - 所以“扫雷 + RPG/怪物等级”不是近年的首次发明；近作的独创性通常体现在战斗节奏、构筑、地图生成、演出和规则组合，而非这个大类本身。

4. **目前最值得深入拆解的五个设计样本：**
   - *14 Minesweeper Variants 1/2*：怎样把一个极小核心系统扩成大量相互正交的规则。
   - *Bombe*：怎样把“反复做局部推理”变成玩家编写、系统验证并永久自动执行的规则。
   - *Mamono Sweeper*：怎样让“数值线索”同时成为空间信息和战斗信息。
   - *Tetrisweeper*：怎样把静态约束题变成玩家亲手塑造约束空间的实时游戏。
   - *Let’s! Revolution!*：怎样把扫雷式信息推断嵌入移动、敌人、技能和资源的回合制决策。

## 二、判定口径

本文用以下标记回答“确定性推理是否仍是主要玩法”：

- **✅ 明确无猜**：官方明确承诺 no guessing / logic-only，或关卡机制本身是手工、可证明地唯一推导。
- **◐ 推理为主，但不保证无猜**：推理依然重要，不过程序生成会产生二选一，或游戏用 HP、技能、资源来吸收不确定性。
- **❌ 非确定性决策为主**：随机掉落、构筑、动作速度、押注或战斗占据核心；扫雷是信息层之一。
- **？ 未找到官方保证**：不能据此断言一定存在猜测，只表示官方材料没有作出保证。

“确定性”在这里不等于棋盘固定；程序生成也可以通过求解器筛选而保证无猜。

## 三、25 个最重要的代表作品

### A. 线索语义与纯逻辑扩展

#### 1. 14 Minesweeper Variants / 14 Minesweeper Variants 2

- **年份 / 平台**：2022、2024；PC。
- **核心变化**：第一作提供 14 套线索规则、每套多种难度与数百关；第二作再增加 14 套“完全不同”的规则，并明确包含**非数字、非整数线索**。关卡程序生成，内置画线/标记工具与分级提示。2025 年官方更新又加入数百个规则组合。
- **为什么有趣**：它不是一次性噱头，而像“扫雷规则的元素周期表”：方向、距离、区域、奇偶、比较关系等维度可以独立替换并组合，特别适合研究哪些约束最易读、哪些组合会产生真正的新推理。
- **确定性推理**：**✅**。官方明确写明每关只需逻辑、不需猜测。
- **来源**：[第一作 Steam 官方页](https://store.steampowered.com/app/1865060/14/)、[第二作 Steam 官方页](https://store.steampowered.com/app/2631960/14___2/)、[第一作官方公告页](https://steamcommunity.com/app/1865060/announcements/)

#### 2. Mine of Sight

- **年份 / 平台**：2016；Web、Android。
- **核心变化**：不同图标不是同一种“邻近计数”的皮肤，而是不同查询算子，例如眼睛看横竖整条视线、爱心指示“孤立”的雷、闪电涉及连通关系；另有生成器和关卡编辑器。
- **为什么有趣**：玩家不是只学一个新数字含义，而是在同一棋盘上交叉使用多种“传感器”。这接近约束满足题：一个格子的结论会同时反馈到数个不同语义的线索中。
- **确定性推理**：**✅**。官方介绍明确主打 no guessing，并由开发者制作、扩充至 168 关。
- **来源**：[开发者发布页](https://www.kongregate.com/en/games/zblip/mine-of-sight)、[开发者 press kit](https://www.indiedb.com/games/mine-of-sight/presskit)

#### 3. Bombe

- **年份 / 平台**：2023；PC。
- **核心变化**：玩家不再逐格重复解题，而是创建“区域变换规则”：在满足某种局部模式时自动标记雷、安全格或生成新区域。规则经形式验证后会永久自动套用。
- **为什么有趣**：它把扫雷从解题变为**提炼算法**。一次发现的推理定理之后都由系统执行，玩家不断向更高阶的例外推进，形成类似自动化、程序综合和定理证明的成长感。
- **确定性推理**：**✅**。官方称有数千个无猜谜题，规则还会接受形式检查。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/2262930/Bombe/)

#### 4. Tametsi

- **年份 / 平台**：2017；PC。
- **核心变化**：使用多种不规则铺砖，不只读取局部邻接数字，还要综合整行、整列和颜色区域的总数约束；包含 100 个手工主关和 60 个额外关卡。
- **为什么有趣**：它证明“扫雷”不需要固定在方格八邻域。区域总量和异形邻接相互锁定后，推理会跨过很长距离，体验更接近高密度数织。
- **确定性推理**：**✅**。商店页写明无需猜测；开发者也明确回答所有谜题均可完全推导。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/709920/Tametsi/)、[开发者关于无猜的说明](https://steamcommunity.com/app/709920/discussions/0/1743352529774852917/)

#### 5. Hexcells / Hexcells Infinite

- **年份 / 平台**：2014；PC。
- **核心变化**：把二元扫雷移到六角格，并加入跨越多格的行列线索、连续/不连续提示；*Infinite* 还提供种子式随机生成和玩家自制谜题。
- **为什么有趣**：其关键并非“方格改六角格”，而是局部数字、直线约束和连续性符号共同工作，使玩家在局部与全局之间来回传播信息。它也成为后来许多“无猜、舒缓、手工扫雷逻辑题”的参照系。
- **确定性推理**：**✅/接近 ✅**。官方关卡以逻辑谜题为定位；社区对生成器的技术说明称其会持续添加线索直至求解器可解。
- **来源**：[Hexcells Steam 官方页](https://store.steampowered.com/app/265890/Hexcells/)、[Hexcells Infinite Steam 官方页](https://store.steampowered.com/app/304410/Hexcells_Infinite/)、[生成器无猜说明](https://steamcommunity.com/app/304410/discussions/0/2561864094357966245/)

#### 6. hexceed

- **年份 / 平台**：2021；PC。
- **核心变化**：六角格上加入方向/直线线索、会阻断信息传播的墙，以及后续逐步叠加的特殊格；基础内容免费，关卡数量达数百。
- **为什么有趣**：墙不是装饰，而是改变一条线索究竟“看得见谁”，因此棋盘拓扑会在局部发生断裂。它展示了遮挡、视线和边界如何成为扫雷线索的一部分。
- **确定性推理**：**✅**。官方明确称所有关卡均可不猜解决。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/1463920/hexceed/)

#### 7. Patterna

- **年份 / 平台**：2016；PC。
- **核心变化**：把方格抽象成**任意图网络**。玩家依据距离、连接关系和颜色判断节点属于 pattern 还是 non-pattern；含 70 多关、程序生成器和编辑器。
- **为什么有趣**：它提炼出扫雷真正的数学内核——不是格子，而是“节点—邻接—计数约束”。一旦允许任意图，同一套认知可用于树、环、长程连边和颜色分层。
- **确定性推理**：**✅**。官方明确标注 no guessing。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/503860/Patterna/)

#### 8. Delete

- **年份 / 平台**：2018；PC。
- **核心变化**：50 个手工塑形关卡分布在不同立体表面，并把 7 类玩法逐渐组合；重点是阅读空间关系，而不是无尽随机盘。
- **为什么有趣**：不同表面的折叠与接触关系会改变“相邻”的直觉，适合作为轻量的空间认知版扫雷；短关卡让每个几何构型都能成为一个独立命题。
- **确定性推理**：**✅**。官方称全部可通过推理解决。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/773670/Delete/)

#### 9. Polimines / Polimines 2

- **年份 / 平台**：2022、2023；PC。
- **核心变化**：把 Nonogram（数织）的行段约束与扫雷的邻接计数合在同一批异形棋盘上；第一作 30 关，第二作 60 个手工谜题并扩展形状与尺寸。
- **为什么有趣**：两套约束不是先后出现的小游戏，而是互相喂信息：数织决定某行的分布结构，扫雷数字决定局部密度。卡住一个系统时，可以从另一个系统绕回。
- **确定性推理**：**✅**。两作官方都明确无需猜测。
- **来源**：[第一作 Steam 官方页](https://store.steampowered.com/app/1892790/Polimines/)、[第二作 Steam 官方页](https://store.steampowered.com/app/2328730/Polimines_2/)

#### 10. Sudo Sweep

- **年份 / 平台**：约 2020–2021；HTML5 / 开源。
- **核心变化**：每个数独格对应一个小扫雷区域；数独填入的数字就是该区域的雷数，而扫雷区域反过来为数独提供候选约束。
- **为什么有趣**：这是很“干净”的双向耦合：不是把两个小游戏并排放置，而是让一个谜题的变量成为另一个谜题的参数。
- **确定性推理**：**◐**。开发者在发布页明确表示没有移除经典扫雷的 50/50 情形，因此不能称为全程无猜。
- **来源**：[开发者 itch.io 页](https://gamesforcrows.itch.io/sudo-sweep)、[官方 GitHub 仓库](https://github.com/vividfax/sudo-sweep)

#### 11. Tales from the Crypt Sweeper

- **年份 / 平台**：2017 game jam；Web。
- **核心变化**：数字被随机符号密码替代，而且每局符号—数字映射都会变化；玩家要先从约束中破译“哪个符号代表几”，再进行普通扫雷推理。
- **为什么有趣**：它在扫雷之上再套一层语言破译。玩家不仅不知道雷在哪里，起初连线索“说的是什么”都不知道；规则学习本身成为谜题。
- **确定性推理**：**◐**。核心可推导，但随机映射初期可能存在多重解释；官方没有作出无猜保证。
- **来源**：[开发者 itch.io 页](https://laundrybear.itch.io/tales-from-the-crypt-sweeper)

### B. 空间拓扑与棋盘结构

#### 12. 4D Minesweeper

- **年份 / 平台**：2018；PC。
- **核心变化**：在四维网格中，一个格子最多有 80 个邻居；可将各维设为环面，形成管、环、立方体等周期拓扑；还提供显示“剩余雷数”的 delta mode。
- **为什么有趣**：它不是仅把视觉做成立体，而是真正改变邻接集合。高维邻居高达 80 个，迫使界面提供高亮和切片，否则人脑无法追踪约束传播。
- **确定性推理**：**✅（内置关卡）**。官方称有 80 多个无猜预设局；随机自定义盘不应自动视作无猜。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/787980/4D_Minesweeper/)

#### 13. Non-Euclidean Minesweeper

- **年份 / 平台**：2024；PC。
- **核心变化**：同时支持欧氏与双曲几何，包括五边形、七边形双曲铺砌以及方格、六角格；专用渲染器处理扭曲视野，专用求解器筛选谜题。
- **为什么有趣**：双曲空间的面积和周长增长规律完全不同，棋盘会在有限屏幕中呈现“向边缘无限扩张”的感觉。邻域度数和环结构也随铺砌改变，推理模式不是平面方格的简单换皮。
- **确定性推理**：**✅**。官方明确写明所有谜题只靠逻辑、无需猜测。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/3380320/_/)

#### 14. Globesweeper

- **年份 / 平台**：2019；PC。
- **核心变化**：在球面上扫雷，支持六边形、三角形、方形模式；规模从 92 格到三角模式 20,480 格，并可选传统生成或 guaranteed solvable。
- **为什么有趣**：球面没有边角，经典扫雷依赖“从角落启动”的经验失效；三角/六角铺砌又让邻居度数变化。它还是少数把大棋盘、拓扑变化与无猜选项同时做到正式产品里的作品。
- **确定性推理**：**✅（选择 guaranteed-solvable 模式时）**；传统模式为 **◐**。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/982220/Globesweeper/)

#### 15. Mastermine

- **年份 / 平台**：2021；PC。
- **核心变化**：把棋盘包在可旋转的三维立方体上，并允许通过能力重新排列棋盘；包含战役、沙盒和限时模式，棋盘尺寸可扩展。
- **为什么有趣**：立方体表面邻接已经要求空间记忆，而“重新排列棋盘”的能力进一步让玩家主动改造约束结构，形成解题与操盘的交叉。
- **确定性推理**：**？**。官方材料没有承诺无猜；能力和模式设计也说明它并非只追求静态唯一解。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/1491530/Mastermine/)

### C. 移动、战斗、RPG 与实时混合

#### 16. Minesweeper Genius

- **年份 / 平台**：2019（Switch）；亦有移动版。
- **核心变化**：行列数字类似数织/数独式总量提示；标出雷后，还必须让 Aristotle 从入口走到传送门。特殊地块可以跳过一个雷。
- **为什么有趣**：揭示答案不是终点，答案必须转化为可行路径。路径规划又会决定哪些区域值得优先推断，使“知道哪里危险”和“怎样经过棋盘”形成闭环。
- **确定性推理**：**✅**。Nintendo 官方页明确称程序生成关卡不依赖猜测或运气。
- **来源**：[Nintendo 官方商店页](https://www.nintendo.com/en-ca/store/products/minesweeper-genius-switch/)

#### 17. Mamono Sweeper

- **年份 / 平台**：约 2010；Web。
- **核心变化**：数字表示邻近怪物**等级总和**，而非怪物数量。点到怪物会战斗：玩家造成自身等级的伤害，未死的怪物反击；击杀获得经验、升级并提高容错，目标是清空所有怪物。
- **为什么有趣**：同一个数字同时回答“附近有多少战斗力”和“我现在能否安全击杀”。玩家可用已知的低等级怪物升级，再回来承担原本危险的揭格；推理顺序与成长路线相互决定。
- **确定性推理**：**◐**。逻辑是主干，但随机盘可能要求风险决策；HP/等级正是用来承受不完全确定性的系统。
- **来源**：[开发者官方游戏页](https://hojamaka.com/games/mamono_sweeper)、[开发者模式列表](https://hojamaka.com/game/mamosui_list2.html)、[Browsercraft 对早期版本的存档说明](https://browsercraft.com/game/mamono-sweeper)

#### 18. Cavern Sweeper

- **年份 / 平台**：2022；Web / 下载版。
- **核心变化**：不再只有一种“雷”。不同怪物对棋盘施加不同形状的影响，玩家需借助图鉴学习各怪物的作用模式。
- **为什么有趣**：线索不再只反映统一八邻域中的二元对象，而是多个“卷积核”叠加的结果。怪物身份和位置共同成为未知变量，推理比简单加总更有层次。
- **确定性推理**：**◐**。开发者在 itch.io 讨论中明确表示生成没有做保证无猜的平衡，可能出现需要猜的局面。
- **来源**：[Hempuli 官方作品页](https://www.hempuli.com/gamelist/index.php?rule=id&ruleid=16)、[开发者 itch.io 页及说明](https://hempuli.itch.io/cavern-sweeper)

#### 19. Tetrisweeper

- **年份 / 平台**：可玩 itch 版持续更新；Steam 版截至调研日仍标为即将推出。
- **核心变化**：四格骨牌实时下落，每个小格同时是扫雷格；一行必须填满并且其中所有安全格/雷都被正确处理，才会消除。玩家还可通过落块位置主动减少未来猜测。
- **为什么有趣**：这是少数把扫雷从“解既成棋盘”改为“边建造棋盘边解”的作品。空间选择、下落速度、局部推理和清行节奏同时施压，并提供 Sprint、Time Trial、Inferno、Freezerburn 等变体模式。
- **确定性推理**：**◐ / ❌（视模式与技术水平）**。局部信息仍按扫雷逻辑，但实时操作和玩家造盘决定胜负；它不以静态唯一解为目标。
- **来源**：[开发者 itch.io 页](https://kertisjones.itch.io/tetrisweeper)、[Steam 官方页](https://store.steampowered.com/app/2918460/Tetrisweeper/)

#### 20. DemonCrawl

- **年份 / 平台**：2019；PC、移动端。
- **核心变化**：把扫雷做成 roguelite：1,000 多件物品、60 多个阶段、100 多种 modifier、天赋、合成、职业、无尽模式；还包括 8 人 PvP Arena 和自动战斗式 Autosweeper。
- **为什么有趣**：物品不是单纯“多一条命”，而是能修改揭格、标记、怪物、经济和局部规则。玩家逐步构筑一台改变扫雷概率与节奏的机器。
- **确定性推理**：**❌**。推理仍重要，但随机掉落、构筑、modifier 和风险承受是核心；“每步都有唯一逻辑答案”不是它的设计承诺。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/1141220/DemonCrawl/)

#### 21. Let’s! Revolution!

- **年份 / 平台**：2023；PC、主机。
- **核心变化**：以扫雷式信息揭示程序生成迷宫中的道路与敌人，再加入回合移动、技能、资源管理、职业和 boss 战。
- **为什么有趣**：它没有要求玩家把整盘雷完整标出；推理的用途是判断敌人与安全通道，从而为一次具体的战术行动服务。不同职业还改变玩家愿意怎样获取和消费信息。
- **确定性推理**：**◐**。位置推断是主要信息工具，但程序地图、敌人和资源使“最优行动”不等于纯逻辑谜题的唯一答案。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/2111090/Lets_Revolution/)

#### 22. BroomSweeper

- **年份 / 平台**：2026；PC。
- **核心变化**：扫雷 roguelike，包含 100 多件物品、角色与 20 层 ascension；“尘兔”、危险材料会改变格子和数字，boss 奖励的钥匙还能颠覆规则。
- **为什么有趣**：它代表 2025–2026 年的新一波方向：不只在扫雷外加装备，而是让状态效果直接污染或改写**线索本身**。这比单纯加伤害值更值得关注。
- **确定性推理**：**❌**。官方卖点是构筑、随机道具、角色和难度爬升，并无无猜承诺。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/3473250/BroomSweeper/)

#### 23. MineSweeper.R

- **年份 / 平台**：2026；PC。
- **核心变化**：把扫雷与类似“法术编程”的 roguelike 构筑结合：50 多种技能 glyph、9 个技能槽，可以编排触发顺序和连锁效果，另有局外成长。
- **为什么有趣**：它试图把玩家在 *Bombe* 中“把推理自动化”的思路改造成战斗构筑：玩家设计的是一段对棋盘生效的技能程序，而不是逐格点击。
- **确定性推理**：**❌**。扫雷提供触发环境，技能组合与 roguelike 随机性才是主要变化。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/4368600/MineSweeperR/)

#### 24. DungeonSweeper

- **年份 / 平台**：2026；PC。
- **核心变化**：以扫雷式战斗探索 5 个程序生成地牢生态，组合职业、商店、经验和装备，并以巨龙为终局目标；官方页面列出大量职业和物品。
- **为什么有趣**：它与 Dragonsweeper 属于最直接可比组：都问“怎样把一次点击从排雷动作变成角色成长与战斗选择”。适合重点对比职业差异是否真正改变推理顺序，还是只改变数值效率。
- **确定性推理**：**◐ / ❌**。推理是战斗输入，但程序地图、职业、物品与资源经营构成主要循环；官方未承诺无猜。
- **来源**：[Steam 官方页](https://store.steampowered.com/app/4109840/DungeonSweeper/)、[开发者官网](https://www.dungeonsweeper.com/)

### D. 叙事、元谜题与多人关系

#### 25. ClueSweeper

- **年份 / 平台**：2010；Web。
- **核心变化**：把 *Minesweeper* 与 *Clue/Cluedo* 式谋杀推理结合。玩家在有限行动中揭开证据，再从嫌疑人特征中确定凶手；另有装备升级和与 AI 竞赛的 Duel Mode。
- **为什么有趣**：局部揭格不是最终目标，而是在搜集一组用于上层推理的证据。它很早就展示了“扫雷棋盘作为调查界面”的可能性，适合叙事型大画幅设计借鉴。
- **确定性推理**：**◐**。证据组合需要逻辑，但案件与棋盘随机生成、行动有限，信息可能不足，因而不是传统意义的全程无猜题。
- **来源**：[开发者发布页](https://www.kongregate.com/en/games/nerdook/cluesweeper)

> 多人代表虽然未单列为第 26 项，仍值得作为一个独立方向观察：  
> **Minesweeper Together（2025，PC）**支持最多 8 人共享清盘、竞速/计分对战、画笔沟通、Workshop，并为 easy–hard 提供 no-guess 模式。其创新主要不在规则，而在把推理变成分工、沟通和执行速度问题。[Steam 官方页](https://store.steampowered.com/app/3550060/Minesweeper_Together/)  
> **Minesweeper Versus（2021，PC）**让双方争夺更多雷，官方还坦率写明多数局面可推理但仍可能出现 50/50；它是研究“双方信息是否对称、抢先揭示是否有博弈价值”的简洁样本。[Steam 官方页](https://store.steampowered.com/app/1518320/Minesweeper_Versus/)

## 四、按机制横向对照

| 机制类别 | 最强代表 | 核心设计问题 | 推理地位 |
|---|---|---|---|
| 规则 / 线索语义 | 14MV、Mine of Sight、Tametsi | 同一隐藏状态可以被多少种可读、可组合的查询描述？ | 通常 ✅ |
| 约束自动化 | Bombe | 玩家能否把发现过的定理永久交给系统执行？ | ✅ |
| 拓扑 / 空间 | Patterna、4D、Non-Euclidean、Globesweeper | 改变邻接关系后，界面怎样让人仍能追踪约束？ | ✅ 或可选 ✅ |
| 与其他逻辑题混合 | Polimines、Sudo Sweep、Minesweeper Genius | 两套规则能否真正互相提供信息，而非轮流玩？ | ✅ 到 ◐ |
| 移动 / 路径 | Minesweeper Genius、Let’s! Revolution! | “知道危险在哪里”如何转化为路径与行动价值？ | ✅ 到 ◐ |
| 战斗 / RPG / 资源 | Mamono、DemonCrawl、BroomSweeper、DungeonSweeper | 生命、经验和装备是在掩盖猜测，还是制造新的可规划决策？ | 多为 ◐/❌ |
| 实时 / 建造棋盘 | Tetrisweeper | 玩家能否通过操作主动创造更可解的未来状态？ | ◐/❌ |
| 叙事 / 元谜题 | ClueSweeper、Tales from the Crypt Sweeper | 揭格获得的信息能否服务于另一层身份、语言或故事推理？ | 多为 ◐ |
| 多人合作 / PvP | Minesweeper Together、Minesweeper Versus | 共享知识、分工、抢答和犯错代价怎样形成社会玩法？ | 模式相关 |
| 无限 / 程序生成 | Hexcells Infinite、DemonCrawl、Globesweeper | 生成器能否同时保证新鲜感、可读性和无猜？ | 差异最大 |

## 五、第二梯队与值得继续观察的方向

这些作品未进入前 25，主要因为规则改动较窄、产品尚早期或一手信息较少，但对完整地图仍有价值：

- **Mamono Mower（2022）**：Hempuli 将 *Mamono Sweeper* 变成角色移动的“割草模拟”；只有等级足够才能割掉障碍并获得经验，dash 可越级处理一个目标。空间执行比纯点击更重要。[开发者 itch.io 页](https://hempuli.itch.io/mamono-mower)
- **Tamago Sweeper（2025）**：不能插旗；数字是邻近敌人等级总和，同时孵蛋、自动射击毛毛虫、升级减少攻击冷却。它显示“自动战斗”也可以成为扫雷信息的反馈层。[开发者 itch.io 页](https://f-i-nn.itch.io/tamago-sweeper)
- **Cavesweeper（2018）**：5×5 战斗盘中，数字统计上下左右的同色格而非雷；误判会让怪物攻击，装备和 HP 承担风险。是非常紧凑的“颜色约束 + 战斗”实验。[Steam 官方页](https://store.steampowered.com/app/880830/Cavesweeper/)
- **Mines Sweeper（PICO-8）**：红线索统计怪物、蓝线索统计宝物、紫线索统计二者；揭到敌人会受攻击，还有生命和能力。以极小体量验证“多种对象、不同计数通道”。[开发者 itch.io 页](https://orion-black.itch.io/mines-sweeper)
- **Infinity Sweeper（2026）**：经典格网叠加商店、卡牌、格子 modifier、四关一次 boss 和 boss 后新增陷阱，典型“逻辑 + 混乱/直觉”路线。[Steam 官方页](https://store.steampowered.com/app/3161400/Infinity_Sweeper/)
- **Dungeon Minesweeper（2024）**：在可破坏、程序生成的地牢中用扫雷获取资源，同时存在敌人、陷阱、阵营、剧情和无尽模式；更像探索生存系统借用扫雷采集。[Steam 官方页](https://store.steampowered.com/app/2662810/Dungeon_Minesweeper/)
- **Minesweeper & Dungeon RPG（2024）**：扫雷用于开地图、找金币和宝箱，再进入技能、装备、道具与区域敌人的成长循环；规则创新弱于内容包装，但可作为市场对照。[Steam 官方页](https://store.steampowered.com/app/3156010/Minesweeper__Dungeon_RPG/)
- **Illumination of Mansion（2025 demo）**：把棋盘映射为 2.5D 洋馆房间，通过投卡揭示，加入狼人、幽灵、陷阱、钥匙和推箱子；是“叙事空间化扫雷”较新的尝试。[开发者 itch.io 页](https://chaos-advice.itch.io/illumination-of-mansion)、[Steam Demo 页](https://store.steampowered.com/app/4086710)
- **BeTrapped!（2004）**：早期商业案例，将等距视角房间、冒险游戏的对话/物品与扫雷机关结合。开发者履历可确认项目与年份，历史报道说明其含 50 个房间和独立 Puzzle Mode。[开发者履历](https://this.scottbilas.com/)、[Adventure Gamers 当年报道](https://adventuregamers.com/news/jane_jensens_betrapped_released)
- **Minesweeper Big Bomb（2025）**：反向目标——主动引爆所有小雷，同时避开唯一“大雷”，另有道具。概念很鲜明，但样本和评价量仍小，且未找到无猜保证。[Steam 官方页](https://store.steampowered.com/app/3707010/Minesweeper_Big_Bomb/)
- **Let’s Minesweeper（2024）**：全球玩家共享一张约 4,800 万格、1,000 多万雷的在线棋盘并争夺区域。它主要改变规模与社会结构，规则本身仍接近经典扫雷。[Steam 官方页](https://store.steampowered.com/app/2865580/Lets_Minesweeper/)
- **m3o**：多人共享近乎无限的棋盘、多颜色旗帜和小时/每日榜单；适合观察协作标记、公共错误和持久世界，而不是新线索语义。[项目官网](https://m3o.xyz/)

截至调研日尚未正式推出、应只放观察名单：

- **Mr. Magpie’s Harmless Card Game**：官方定位为 corporate-horror “Minesweeper roguelike”；翻牌赚钱、读取提示、避开 JERRY 死亡牌并随时 cash out，显然更接近押注/卡组构筑。[Steam 官方页](https://store.steampowered.com/app/3616280/Mr_Magpies_Harmless_Card_Game/)
- **Dungeon Sweeper Plus**：在近乎无限世界中拓展领地，墓碑给出邻近地牢数，另有三条命、生态群落、事件和百科；截至 2026-07-31 仍为 upcoming。[Steam 官方页](https://store.steampowered.com/app/4562750/Dungeon_Sweeper_Plus/)、[2023 年免费原型](https://setamopixel.itch.io/dungeon-sweeper)
- **Boom Boom No Guess Minesweeper**：官方计划 2026-11-03 上线，宣称无猜、战斗、100 关、道具和英雄；上线时间晚于本报告截止日，不能按已发行产品评价。[Steam 官方页](https://store.steampowered.com/app/4528230/Boom_Boom_No_Guess_Minesweeper/)

## 六、对设计与市场调研最有用的观察

### 1. 真正有辨识度的创新，通常至少改变两层

只改一层常沦为熟悉玩法的外观变化：

- 只把方格改六角格，未必产生新体验；
- 只加经验值，未必产生新决策；
- 只把棋盘放得巨大，未必产生新乐趣。

强样本往往让两层发生耦合：

- *Mamono Sweeper*：**线索数值含义 + 战斗成长**；
- *Minesweeper Genius*：**行列约束 + 路径执行**；
- *Tetrisweeper*：**实时落块 + 玩家主动塑造未来约束**；
- *Bombe*：**局部逻辑 + 自动化元进度**；
- *ClueSweeper*：**揭格证据 + 上层身份推理**。

### 2. RPG 扫雷的三个成熟度层级

1. **容错层**：HP、护盾、复活只是让猜错不立即结束。
2. **效率层**：装备和技能帮助多揭格、改概率、赚资源。
3. **语义层**：角色能力改变数字的含义、对象的邻域、可见信息或推理顺序。

第三层才最容易形成独创身份。*BroomSweeper* 的危险材料修改格子/数字、*Cavern Sweeper* 的不同怪物拥有不同影响图形，都比“加一条命”更接近语义层。

### 3. 程序生成的关键不是数量，而是可验证性

- *Hexcells Infinite*、*14 Minesweeper Variants*、*Non-Euclidean Minesweeper* 把求解器或无猜保证视为产品功能。
- *Cavern Sweeper* 则公开接受随机生成造成猜测，把风险作为体验的一部分。
- 两条路线都可以成立，但宣传和反馈系统必须一致：若游戏自称逻辑题，50/50 会被视为瑕疵；若游戏给足 HP、技能和撤退选择，概率决策可以成为内容。

### 4. 多人模式目前大多创新在“执行”，而非“知识”

现有多人作品主要是：

- 共享同盘并分区清理；
- 同种子竞速；
- 抢分或争夺雷；
- 用涂鸦/标记沟通。

相对少见、仍有空间的方向是：

- 每位玩家只能看见不同类型的线索；
- 玩家角色拥有不对称传感器；
- 一人的动作会改变另一人的邻域或线索；
- 需要口头传递约束，但禁止直接指出坐标。

换言之，市场已经验证“多人扫雷能跑起来”，但“信息不对称合作扫雷”仍未被代表作占满。

### 5. 叙事与超大画幅的机会仍然明显

大型作品多走两极：

- 巨大/无限但规则接近经典，如 *Let’s Minesweeper*、m3o；
- 玩法丰富但每盘仍是小型 roguelite 房间，如 *DemonCrawl*、*BroomSweeper*。

较少见的是：**一张长期存在的大地图，不同区域逐步引入新线索语义，解开局部后又改变整个世界的可见性、叙事和通行结构**。*ClueSweeper*、*Illumination of Mansion* 和 *Minesweeper Genius* 各自只实现了其中一部分。若要做类似 Proverbs 那种“大画幅但不空洞”的产品，这可能是最值得探索的组合。

## 七、建议给总报告的精简推荐清单

若总报告篇幅有限，可保留这 15 个，已经能覆盖主要创新面：

1. 14 Minesweeper Variants 1/2
2. Mine of Sight
3. Bombe
4. Tametsi
5. Hexcells Infinite
6. Polimines 1/2
7. Patterna
8. 4D Minesweeper
9. Non-Euclidean Minesweeper
10. Minesweeper Genius
11. Mamono Sweeper
12. Tetrisweeper
13. DemonCrawl
14. Let’s! Revolution!
15. ClueSweeper

若希望更贴近 2026 年市场，再追加 *BroomSweeper*、*MineSweeper.R*、*DungeonSweeper*；若希望强调多人和大画幅，再追加 *Minesweeper Together*、*Globesweeper*、*Let’s Minesweeper*。

