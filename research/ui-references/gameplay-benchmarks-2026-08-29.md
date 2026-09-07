# 《瓦罗王的餐桌》玩法近亲 UI 标杆研究

日期：2026-08-29
范围：数字线索网格、扫雷式邻域推理、数织（Picross/Nonogram）与可视化逻辑棋盘的**成熟商业作品**。本报告不把“有格子”的任何游戏都算作同类：四个样本都至少有一层可由数字推导的格盘逻辑，并且有足够完整的叙事、进程或系统包装可供 UI 借鉴。

当前项目的规则仍是 Fill-a-Pix/Mosaic 近亲：数字统计同一国家内、以自身为中心的最多 `3×3` 范围（含中心），而非传统扫雷的翻格风险，也不是数织的行列段数；项目规则以 [README.zh-CN.md](../../README.zh-CN.md) 为准。因此，下述不是“照搬数织”，而是研究成熟逻辑游戏怎样让**棋盘、落笔、提示、进度与叙事**不互相抢读。

## 研究方法与样本边界

- 只使用开发商、发行商、平台方或 Nintendo 的第一方商店页、官方宣传页、官方截图；截图中的界面结论均为本报告对该图的直接视觉观察。
- 排除了纯网页扫雷、练习工具、只有单屏小关的轻量作品，以及以极简留白为全部风格的样本；这四款均有官方描述的多关卡、进程、叙事或 roguelite 系统。
- “近亲程度”只说明可借鉴的界面问题，不暗示规则相同。特别是 *Murder by Numbers*、*Picross 3D* 与 *Logiart Grimoire* 都是数织类行/列线索；*DemonCrawl* 是有风险与道具的扫雷 roguelite，和本项目的无猜、预置线索契约不同。

| 样本 | 近亲性与成熟度（第一方说明） | 可看的官方素材 | 最值得借的 UI 问题 |
| --- | --- | --- | --- |
| *DemonCrawl*（Therefore Games，2019） | 官方定位为“扫雷 + 数百物品、关卡与能力”的 puzzle roguelite，另列出 1,000+ 物品、60+ 关卡、模式和长期天赋，足以观察高密度棋盘与元系统如何共存。[Steam 官方页](https://store.steampowered.com/app/1141220/DemonCrawl/) | [常规棋盘](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1141220/ss_d8bb9d46b3676ac54937a28536c9fed7e007e986.1920x1080.jpg?t=1781462805) · [复杂局面与底栏](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1141220/ss_f7bde6f1973ae727b1021b55dc44d6d9bcf0fa07.1920x1080.jpg?t=1781462805) | 主题强、状态多时，怎样仍让局部数字与格子先被读到。 |
| *Murder by Numbers*（Mediatonic，2020） | 官方循环是“解 pixel puzzle → 得线索 → 盘问证人”，是数织与叙事调查直接互相供料的成熟案例。[Steam 官方页](https://store.steampowered.com/app/1140290/Murder_by_Numbers/) | [数织工作面](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_f6911f9c5b39f2faaca99323d8f59b1a2019f424.1920x1080.jpg?t=1616521299) · [对话状态](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_1a72e6e2b6dd0fbf06df47bb0d467faf40894506.1920x1080.jpg?t=1616521299) | 解谜操作面与长文本叙事何时同屏、何时切换。 |
| *Picross 3D: Round 2*（HAL Laboratory / Nintendo，2016） | Nintendo 官方页说明有 300+ 个 3D 谜题、三档难度、主题书册与由小题组成的大型 construction challenge；不是单次小谜题。[Nintendo 官方页](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-games/Picross-3D-Round-2-1136168.html) | [带工具角标的实机画面](https://www.nintendo.com/eu/media/images/06_screenshots/games_5/nintendo_3ds_7/3ds_picross3dround2/3DS_Picross3DRound2_02.jpg) · [起始数字体块](https://www.nintendo.com/eu/media/images/06_screenshots/games_5/nintendo_3ds_7/3ds_picross3dround2/3DS_Picross3DRound2_01.jpg) | 在棋盘空间很宝贵时，提示和工具如何退到四角而不消失。 |
| *Logiart Grimoire*（Jupiter，2024） | 官方说明为行/列数字的 picture logic，带可关闭辅助；280 题、六种尺寸，并以 fusion、类别解锁与角色成长连接题目，是完整元进程而非练习软件。[Steam 官方页](https://store.steampowered.com/app/2492390/Logiart_Grimoire/) | [数织工作面](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_7748a2bee37581349c9d477e8655d82b68c7820b.1920x1080.jpg?t=1748336527) · [题目/合成选择面](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_58ab77a0c62dc4cb737382018a9a0d43385768b7.1920x1080.jpg?t=1748336527) · [官方产品页](https://www.jupiter.co.jp/e/game/logiartgrimoire/) | 高对比工作盘如何和浓主题、收藏/解锁页分层。 |

## 各样本的实际 UI 观察

### 1. *DemonCrawl*：主题压在棋盘外，系统压在边缘

官方商店页将它定义为把扫雷与物品、阶段、能力结合的 puzzle roguelite，并明确列出大量物品、阶段、天赋和 Codex 记录。[官方说明](https://store.steampowered.com/app/1141220/DemonCrawl/) 这让它是“系统非常多但主操作仍是一块格盘”的好反例与好参照。

从两张官方棋盘截图可直接观察到：

1. 棋盘占据画面中心绝大部分；阴森像素场景只在棋盘外缘显影。已翻数字格保持明亮、规则的方块外框，未翻格和敌对/道具格通过更强的色相与图标区分。[常规棋盘截图](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1141220/ss_d8bb9d46b3676ac54937a28536c9fed7e007e986.1920x1080.jpg?t=1781462805)
2. 计数器被收进左侧窄竖列；角色、生命/资源和若干装备槽在底栏，不把数值说明做成大段侧栏文字。[复杂局面截图](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1141220/ss_f7bde6f1973ae727b1021b55dc44d6d9bcf0fa07.1920x1080.jpg?t=1781462805)
3. 即使格子上存在怪物、战利品、旗帜、数字等多种语义，当前指针和格边框仍足够粗；主题像素纹理没有铺进数字字形本身。

**可迁移：**把《瓦罗》的“考古材料感”放到棋盘外框、空白区、页边索引和完成时反馈；把国家边线、数字、状态格和当前 `3×3` 范围保留为干净、高对比的操作层。紧凑地集中显示“已完成国家 / 提示 / 检查”也比三块说明卡更有效。

**不可迁移：**不要引入装备槽、生命条、概率风险、敌人图标或把国家完成进度做成 RPG 战斗 HUD。本项目的价值是无猜推演；额外资源条会暗示不存在的失败成本。

### 2. *Murder by Numbers*：叙事有存在感，但不常驻占用工作面

该作官方循环直接把 pixel puzzle 的结果转成盘问证据。[Steam 官方说明](https://store.steampowered.com/app/1140290/Murder_by_Numbers/) 其截图非常适合观察“故事包装”而非只看数织规则。

从官方素材可直接观察到：

1. 工作态把数织盘悬在场景之上：列线索紧贴棋盘顶部、行线索紧贴左侧，粉色粗分组线帮助扫视；格盘与线索的物理邻接关系非常明确。[数织工作面](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_f6911f9c5b39f2faaca99323d8f59b1a2019f424.1920x1080.jpg?t=1616521299)
2. 该画面上方只保留 `HINTS` 开关、两种落笔状态和菜单按钮；机器人搭档与案件场景提供氛围，却不把案情正文挤入棋盘旁。
3. 活动态中，当前格是高饱和描边；填黑与 `×` 的形状不同于线索数字，错误/排除不会只靠一个颜色表达。
4. 对话则切到独立的底部大文本框，配发言人标签和下一步箭头，而不是在解题期间让长叙事永久常驻。[对话状态](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_1a72e6e2b6dd0fbf06df47bb0d467faf40894506.1920x1080.jpg?t=1616521299)

**可迁移：**将“国家完成 → 亡国记录 / 晚宴节点”做成明确的完成过场或可重读抽屉；活动解谜屏只露出一枚档案/晚宴计数和一个可打开入口。三种落笔工具应像截图里的两个状态一样可一眼判别，并有键盘替代。

**不可迁移：**不应复制其 90 年代荧光漫画、半透明蓝色大板或粉色粗五格分组。后者服务数织行列，不能错误地暗示《瓦罗》存在五格或行列约束。

### 3. *Picross 3D: Round 2*：把辅助放进角落，把“当前推理对象”放大

Nintendo 官方页说明每题由数字提示决定保留/敲掉哪些方块，并使用两种颜色；页面还强调三种难度、书册解锁和由多个谜题组成的大型场景。[玩法说明](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-games/Picross-3D-Round-2-1136168.html#How-to-play)（若锚点不跳转，可查看同页 “How to play” 段落）。

从官方页面/截图可直接观察到：

1. 立体方块是画面唯一的大主体；暂停在左上、灯泡提示在右上、工具图标收在左下。辅助功能可发现，却没有任何长侧栏抢走模型空间。[工具角标截图](https://www.nintendo.com/eu/media/images/06_screenshots/games_5/nintendo_3ds_7/3ds_picross3dround2/3DS_Picross3DRound2_02.jpg)
2. 数字直接印在可推理的方块面上，蓝/橙两种填色与数字颜色相互呼应；当前选择的方块、工具色和可保留/敲除行为能在同一视野中理解。
3. 起手局面用很干净的浅色方块、深色数字、弱纹理背景呈现；即使是“咖啡馆 / 书册”包装，也没有让木纹或插画盖到关键数字上。[起始数字体块](https://www.nintendo.com/eu/media/images/06_screenshots/games_5/nintendo_3ds_7/3ds_picross3dround2/3DS_Picross3DRound2_01.jpg)
4. 其官方页面把解锁与大型模型说明放在书册/进程层，而非声称必须在每题旁永久显示全部收藏信息。

**可迁移：**在《瓦罗》选择一个数字时，让“该数字 + 被国界裁掉后的真实 `3×3` 范围”成为唯一被放大的推理对象；提示、设置、工具可以是屏幕边缘的大点击靶，不必占据厚侧栏。

**不可迁移：**不要用蓝/橙方块语义或 3D 体雕结构替代亮/暗/未知状态。它的数字代表行列中的体块数量，与本项目的同国邻域计数不同。

### 4. *Logiart Grimoire*：把“解题桌”与“魔法书进程”拆成两个界面

Jupiter 的官方 Steam 文案明确说明：Logiart 是使用纵横数字提示完成插画的 picture logic，辅助可开关；完成题目会成为 fusion 材料，进而解锁新题，且有 280 题与类别解锁。[官方功能说明](https://store.steampowered.com/app/2492390/Logiart_Grimoire/)

从官方截图可直接观察到：

1. 活动谜题屏有大面积、低噪声的白色格盘；行/列线索紧贴其左/上边，格子、`×` 标记和数字的对比强于深色魔法背景。[数织工作面](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_7748a2bee37581349c9d477e8655d82b68c7820b.1920x1080.jpg?t=1748336527)
2. 同一截图中，当前行是紫色条、当前格为紫色框，细绿色引导线穿过格盘；这提供了“我正在解哪一条约束”的即时定位，不需要文字解释。
3. 计时、题号、辅助/评分图标与鼠标输入提示均被压进棋盘左缘或上缘；角色、类别、合成文本没有与格盘争夺中央区域。
4. 题目选择/融合屏才展示角色、品类标签、缩略图、等级、进度条和长提示文字，和解题工作面是不同状态。[题目/合成选择面](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_58ab77a0c62dc4cb737382018a9a0d43385768b7.1920x1080.jpg?t=1748336527)

**可迁移：**将《瓦罗》的“地图册 / 已完成国家 / 亡国档案”做成具有收藏感的独立档案页，保留缩略图、编号、国家名、完成印记和进度；活动棋盘只需一条短的当前章节/国家进度。当前线索可采用“选中格 + 对应范围”的双重高亮，类似该作的行/格定位，但范围必须按同国 `3×3` 裁剪。

**不可迁移：**不要把紫蓝霓虹、浮游粒子、角色立绘或魔法合成的视觉强度搬到石碑/地图主题里；也不要把计时或星级作为主压力来源，除非日后明确要加入该目标。

## 横向归纳：可证据支持的 UI 原则

下表中的“结论”是基于上方官方截图的设计推断，不是原作官方声称的规则。

| 共同的可观察做法 | 设计推断 | 对《瓦罗王的餐桌》的直接要求 |
| --- | --- | --- |
| 活动态中，*DemonCrawl*、*Murder by Numbers* 和 *Logiart* 都把棋盘放在视觉中心；主题场景、角色或材质在其外圈。[DemonCrawl](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1141220/ss_d8bb9d46b3676ac54937a28536c9fed7e007e986.1920x1080.jpg?t=1781462805) · [Murder](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_f6911f9c5b39f2faaca99323d8f59b1a2019f424.1920x1080.jpg?t=1616521299) · [Logiart](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_7748a2bee37581349c9d477e8655d82b68c7820b.1920x1080.jpg?t=1748336527) | 题材感不等于把纹理塞进每格；操作密度最高的区域应有最少噪声。 | 棋盘单元格去掉纸张颗粒、压印和细插画；石灰岩/账册质感留在页边、卡片、章节转场和完成印章。 |
| 数字/约束与它作用的对象在物理位置上紧贴：数织把线索贴行列，3D Picross 把数字印在体块面上。[Murder](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_f6911f9c5b39f2faaca99323d8f59b1a2019f424.1920x1080.jpg?t=1616521299) · [Nintendo](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-games/Picross-3D-Round-2-1136168.html) | 玩家应看见“这个数字正在约束什么”，而非只看见一个装饰性光效。 | 点/键盘聚焦一个线索时，画出**准确的、仅同国的 `3×3` 裁剪遮罩**，并在紧邻处显示“有效格数 / 当前已标亮数”（不泄露答案）。 |
| 输入状态由形状、描边、图标或文字共同区分：*Murder* 的黑格与 `×`、*Logiart* 的 `×` 与白格、*Picross 3D* 的工具角标都不是纯色差。[Murder](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_f6911f9c5b39f2faaca99323d8f59b1a2019f424.1920x1080.jpg?t=1616521299) · [Logiart](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_7748a2bee37581349c9d477e8655d82b68c7820b.1920x1080.jpg?t=1748336527) | 颜色是加速器，不应是唯一语义。 | 亮 / 暗 / 擦除三工具维持图标、文字、快捷键与选中框；朱砂与玉绿若继续使用，必须配轮廓/虚线/标签，不能只凭红绿区分。 |
| 大段叙事和收集进程在 *Murder* 的对话态、*Logiart* 的融合态、*Picross 3D* 的 Café/Books 进程中是独立状态，不是所有内容永远占着棋盘旁。[Murder 对话](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1140290/ss_1a72e6e2b6dd0fbf06df47bb0d467faf40894506.1920x1080.jpg?t=1616521299) · [Logiart 融合](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_58ab77a0c62dc4cb737382018a9a0d43385768b7.1920x1080.jpg?t=1748336527) · [Nintendo 的 Books 说明](https://www.nintendo.com/en-gb/Games/Nintendo-3DS-games/Picross-3D-Round-2-1136168.html) | “故事重要”不等于“故事始终可见”；切换反而能给完成一个国家真正的节奏。 | 晚宴记录、亡国档案和地图册改为完成时弹出的档案卡 / 可重开抽屉；常驻只保留一个可读的章节计数与入口。 |
| 复杂系统可以集中到细窄 HUD 或单独索引页，而不是让四周都有同权重面板。[DemonCrawl](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1141220/ss_f7bde6f1973ae727b1021b55dc44d6d9bcf0fa07.1920x1080.jpg?t=1781462805) · [Logiart](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2492390/ss_58ab77a0c62dc4cb737382018a9a0d43385768b7.1920x1080.jpg?t=1748336527) | 周边信息应有主次；眼睛回到棋盘的路径越短越好。 | 桌面版将工具与检查收为单条工作栏；地区索引可在棋盘上方横向排列；档案不再做永久右栏正文。 |

## 与当前“碑刻拓印／田野账册”结论的比对

此前原画评审推荐 04「碑刻拓印／田野账册」：石灰岩、炭墨、深靛、氧化青铜组成原创考古档案语言，并强调棋盘、三种工具、地区筛选、晚宴与档案的层级。[现有原画验收](../../docs/ui-concepts/README.zh-CN.md) 这次研究**不推翻题材结论**，但会把它从“完整陈列台”收紧为“可长期工作的修复台”。

| 04 的既有判断 | 对照样本后的结论 | 优化动作 |
| --- | --- | --- |
| 选“后世修复者 / 历史证物”而非现世宫廷，是题材正确的主轴。 | 保留。四款都说明主题外壳可以很强，只要工作盘仍是视觉中心。 | 继续用石灰岩、账册、拓印、分类编号和低饱和矿物色；避免真实文明的直接符号借用。 |
| 左侧“修复说明 + 三工具”、右侧“晚宴正文 + 档案卡”在原画中同时常驻。 | 需要收缩。*Murder* 和 *Logiart* 最有说服力地表明：叙事/收藏页应在有意义的切换点获得完整注意力。 | 解题态取消永久右侧叙事正文；左侧教学说明只在教学关或按“规则”展开。把工具、提示、检查组合成一条短工作栏。 |
| `3×3` 虚线作用域已被指出必须严格裁剪。 | 必须升级为第一优先级交互，而非装饰。*Picross 3D* 与 *Logiart* 都让“当前约束对象”非常明确。 | 线索聚焦时：高亮线索格、以蒙层/描边显示同国有效格、显示有效格计数；跨国格必须明确淡出且不能被框入。 |
| 04 用大量纸张、压痕、夹子、尺和卡片制造历史感。 | 材料感可保留在外框，不能降低 20×20 数字阅读。*DemonCrawl* 和 *Logiart* 均将高频数字放在更干净的表面。 | 单格使用近乎无纹理的浅石面；数字用稳定的深炭色；国家边界比普通网格更强，但不使用过多阴影或装饰。 |
| 01 的朱砂焦点与玉绿范围是吸收项。 | 可保留为少量“临时交互信号”，但要兼顾色觉与可读性。 | 朱砂＝当前线索/错误检查的强调描边；玉绿＝范围描边+角标/虚线；所有状态另配形状、文字及键盘焦点。 |

## 优化后的审美与信息架构建议

### 结论：选 04，但换成“档案修复工作台”，不要做“满屏博物馆陈列”

建议的美术语言可命名为 **「石碑拓印 × 修复账册」**：冷灰石灰岩与旧纸只构成台面；炭墨数字、深靛暗格、氧化青铜的结构线维持理性；朱砂和低饱和青绿仅在用户当前动作发生时出现。历史感来自**分类、修订、压印、国界和保存痕迹**，而非不停叠加古董道具、浮雕或纹样。

推荐的桌面端层级如下（文字结构，不是新增功能承诺）：

```text
细页眉：章节 / 当前地图 / 已完成国家数 / 档案入口
地区索引：七国标签 + 完成印记（紧贴棋盘上缘）

                    ┌──────────── 主棋盘（最大面积） ────────────┐
短工作栏：亮 / 暗 / 擦除   │ 数字、国界、当前线索和严格裁剪 3×3 范围 │
提示 / 检查 / 清错         │                                      │
                    └───────────────────────────────────────────┘

按需出现的线索检视器：有效格数、已标状态、规则说明
完成国家后：晚宴节点 → 亡国档案卡 → 可重开地图册
```

### 三个落地优先级

1. **P0：先保证推理面。** 20×20 棋盘应获得绝对最大的桌面宽度；数字与深靛暗格对比稳定；国家边界、键盘焦点、当前格和 `3×3` 作用域在任何缩放下都可区分。纸纹、拓印和完成区域的地貌线都不得盖住数字。
2. **P1：把工具变成动作，而不是说明。** 常驻的是三枚有文字/图标/快捷键的工具和提示、检查、清错；“亮 / 暗 / 擦除”选中态清晰。教程把同国裁剪规则在首三页逐次示范，正式图不持续占用大块说明区。
3. **P2：让叙事变成奖励节奏。** 完成某国时才用完整的餐桌节点与档案卡占据画面；平时以一个简洁计数或书签提示未读记录。地图册页面可以比解题屏更富纹理、缩略图和说明文字，因为那里不是高密度推理场。

## 最终判断

外部参照没有支持“把瓦罗做成宫廷奢华 UI”或“把每一条剧情永久摆在棋盘旁”的方向。它们一致支持的是：**高可读、可定位的逻辑工作面，外加有明确进入/退出时机的叙事与进程页。**

因此更新后的首选仍为 04，但其实施准则应从“碑刻拓印的双侧栏原画”改为：

> **考古档案工作台：棋盘先于陈设，国界先于纹样，当前约束先于剧情；完成一个国家之后，历史才完整地开口说话。**
