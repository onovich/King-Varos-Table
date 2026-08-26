# 《Proverbs》玩法、同类谱系与原创性核查

> 调研日期：2026-07-31  
> 调研范围：游戏官方页面与预告片、开发者访谈、Steam 成就与更新记录、Fill-a-Pix/Mosaic 原始规则与历史、早期商业产品及代码仓库。  
> 结论强度说明：下文将“已有直接证据”“合理推断”“未检出但不能证明不存在”分开表述。

## 一页结论

1. **《Proverbs》的底层谜题机制不是独创。**它在规则分类上就是 **Fill-a-Pix / Mosaic**：给格子标记明暗，数字 0–9 表示以该格为中心的 3×3 范围内有多少个“亮格”，且计入数字格自身。这套规则在 2003 年已由 Conceptis 商业发行；其构思还可追溯到 Trevor Truran 在 1970 年代末开始发展的原型。
2. **它也不是严格意义上的“扫雷＋数织（Nonogram/Picross）规则融合”。**它没有数织的行列连续段提示。更准确的说法是：**扫雷式邻域计数的 Fill-a-Pix/Mosaic，配上数织式“完成一块便显出图片”的反馈与长线拼画体验。**
3. **“单张超大画布＋分区解谜＋揭示像素画”也不是《Proverbs》首创。**同一开发者 Mark Ffrench 在 2024-05-02 先发布了《Mega Mosaic》：一张 250×250、共 62,500 格的单体谜题，完成子区域便揭示像素画；《Proverbs》是其后继作品。
4. 《Proverbs》的辨识度主要来自**组合与内容设计**：54,488 格的连续画布、259 个不规则且彼此自封闭的小谜题、解谜黑白图案与最终彩色画作相分离、把老勃鲁盖尔 1559 年《尼德兰箴言》拆成“找画面细节＋读谚语解释＋收集成就”的漫长文化拼图。
5. 截至本次检索，**没有找到早于 2024-11-07、与上述整套组合完全相同的产品**。但这只能支持“具体组合很有辨识度”，不能支持“世界首创”。开发者本人也明确说过，他不主张拥有这套谜题机制。

## 1. 游戏身份与规模

《Proverbs》由独立开发者 **Mark Ffrench** 制作，发行方为其个人工作室 **Divide The Plunder**，完整版于 **2024-11-07** 在 Steam 上发布。当前正式版平台是 Windows 与 macOS；游戏官网所列 iOS、Android、Nintendo Switch 仍是 “Coming Soon”，不应写成已经上市。  
来源：[Steam 官方商店页](https://store.steampowered.com/app/3083300/Proverbs/)、[游戏官网](https://www.proverbsgame.com/)、[Mark Ffrench 官方个人页](https://www.markffrench.com/)。

官方文案把它描述为一张超过 54,000 格的单体谜题。进一步逐帧查看[官方预告片](https://www.youtube.com/watch?v=GOdcBtby5QM)，开场 0.00% 时右上角的剩余格数为 **54,488**，所以可以把 54,488 作为画面中可核验的精确总格数；但官方文字规格仍只承诺 “54,000+”。游戏官网另明确给出 **259 个区域**。因此最稳妥的写法是：

- 官方规格：54,000+ 格、259 个区域；
- 预告片 UI 可核验的实际总量：54,488 格；
- 画布行列数并未在官方文字中公布，不宜把根据画面比例反推的尺寸当成官方参数。

它重构的是老彼得·勃鲁盖尔（Pieter Bruegel the Elder）1559 年的《尼德兰箴言》（*Netherlandish Proverbs*）。官方称完成各区可显出 100 多幅画中细节；原作及其中谚语的背景可由[柏林国家博物馆 Google Arts & Culture 专题](https://artsandculture.google.com/story/the-proverbs-gemaldegalerie-staatliche-museen-zu-berlin/hAWBUsSHOXLXIQ?hl=en)交叉核对。

试玩版于 2024-10-04 上线，包含完整谜题约 10%，且进度可带入正式版。来源：[《Proverbs Demo》Steam 官方页](https://store.steampowered.com/app/3219020/Proverbs_Demo/)。

## 2. 它实际上怎样玩

### 2.1 单格规则

玩家不是“点开格子找雷”，而是给尚未判定的格子赋予两种逻辑状态：

- 亮 / true；
- 暗 / false。

一个数字格上的 **0–9** 表示：以它为中心、最多 3×3 的邻域中，共有多少个格子最终应为亮色；**数字所在格自身也被计算在内**。例如数字 9 意味着完整 3×3 九格全亮，数字 0 意味着其中没有亮格。

初始时数字位置已经显示，部分格子没有数字。玩家依靠多个邻域的交叠约束推出全部格子的明暗，而不是像经典扫雷那样先点击安全格、再逐步翻开线索。官方预告片展示左键和右键分别标记两种状态；后续更新还加入 Shift＋点击作为右键替代。来源：[官方 Steam 更新记录](https://steamcommunity.com/app/3083300/allnews/)。

### 2.2 分区规则

全画布被切成 259 个不规则区域。每个区域是一个**独立、自封闭的小谜题**：

- 区域边缘按该小谜题的外边界处理；
- 邻域在边界处只计算区域内有效格；
- 玩家可以在不同区域之间自由切换，不必按固定顺序推进；
- 每区由生成器和求解器验证可纯逻辑解出，不要求猜测。

这一点不是普通矩形 Fill-a-Pix 的表面换皮，而是《Proverbs》相对开发者前作最明确的结构变化。Mark Ffrench 在访谈中解释：《Mega Mosaic》用一格宽的边框分隔小区；《Proverbs》取消这类隔墙后，为了仍能提供可靠的起手点，就让每个不规则区域成为独立谜题。来源：[The Geekly Grind 对 Mark Ffrench 的开发者访谈](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)。

### 2.3 “解出来的黑白图案”并不是最终图片

这是理解《Proverbs》与传统 Fill-a-Pix 差异的关键：

- 传统 Fill-a-Pix 通常让解出的黑白格本身组成隐藏像素画；
- 《Proverbs》的底层明暗答案由**随机噪声式的二值解**生成；
- 区域全部判定正确后，游戏才把它替换或覆盖为另一张完整彩色像素画；
- 因而玩家并不是直接“解出勃鲁盖尔画作的黑白轮廓”，而是在完成一张逻辑凭证后解锁该区域的美术内容。

开发者在同一访谈中明确说，他没有尝试让正负空间本身对应最终插画，因为把复杂画作转换成可辨认的纯黑白图并不现实。他也披露了生成流程：先为区域生成随机二值答案和全线索版本，再由求解器反复移除冗余线索，无法保证可解的余部则重新随机化，最终保留一组可纯推理完成的线索。

### 2.4 区域完成、全盘进度与胜利条件

完成一个区域后，游戏会：

1. 播放缩放或揭示动画，把该区变成彩色像素画；
2. 对包含谚语的区域显示原画细节、历史谚语及现代解释；
3. 对相应内容授予 Steam 成就；
4. 同时更新当前区域百分比和整张画布百分比。

[Steam 官方成就页](https://steamcommunity.com/stats/3083300/achievements)共列出 **94 项成就**：其中 93 项对应谚语/区域内容，最后一项 **Dutch Master** 要求解完整张谜题。游戏官网所说的 259 区明显多于谚语成就数，说明“区域”与“谚语条目”不是一一对应：有些区域主要承担画面拼合。

完整胜利条件就是把全盘做到 100%。官方更新说明只有整张画布全部解完后才显示 “Watch Replay”，并提供终局回放。错误可以借助错误提示、清错及撤销修正；结合它没有经典扫雷的踩雷爆炸流程，可以判断其核心压力来自推理与长线完成度，而不是生命或即时失败。来源：[官方更新记录](https://steamcommunity.com/app/3083300/allnews/)；操作与进度还可由[The Gaming Outsider 评测](https://thegamingoutsider.com/2024/12/16/proverbs-pc-review/mszymanski/)交叉核对。

## 3. 为什么它不宜被叫作“真正的扫雷＋数织”

三种规则的形式区别如下：

| 谜题 | 线索位置 | 线索含义 | 最终图案 |
|---|---|---|---|
| 经典扫雷 | 翻开安全格后出现 | 周围八格中雷的数量；踩雷通常失败 | 通常不以成画为目标 |
| 数织 / Nonogram / Picross | 网格外的每行、每列 | 该行列中连续填色段的长度与顺序 | 填色格直接组成图片 |
| Fill-a-Pix / Mosaic / 《Proverbs》 | 网格内部的数字格 | 以该格为中心的 3×3 中亮/填色格数量，计入自身 | 传统品类直接成黑白图；《Proverbs》完成后另行揭示彩色图 |

所以：

- 从推理局部性看，它确实“像扫雷”；
- 从完成图片和放松式涂格体验看，它确实“像数织”；
- 但从规则学与既有品类名看，**它首先是 Fill-a-Pix / Mosaic，而不是把 Minesweeper 与 Nonogram 两套线索系统同时放进一张盘面。**

这种叫法不是在否定官方营销。任天堂对《Fill-a-Pix: Phil's Epic Adventure》的官方介绍也说该类型经常被描述为 Minesweeper 与 Picross 的混合；只是做原创性判断时，必须追到更精确的既有品类。来源：[任天堂官方产品页](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-download-software/Fill-a-Pix-Phil-s-Epic-Adventure-1397444.html)。

## 4. 可核验的机制谱系

| 时间 | 作品 / 事件 | 与《Proverbs》的关系 |
|---|---|---|
| 1970 年代末至 2001 | Trevor Truran 从“一个格子如何受邻居决定”的想法发展 0–9 邻域谜题，后来加入成画目标；2001 年底把原型交给 Conceptis | 核心规则与“完成后成为图片”的源头 |
| 2003-02 | Conceptis 正式推出 Fill-a-Pix；同年进入手机、杂志和世界谜题锦标赛 | 证明该机制在《Proverbs》之前约 21 年已商业化 |
| 2017-01 | Conceptis 推出纸质《Mega Mosaik》，每题 60×100、6,000 格 | 证明“大画幅 Fill-a-Pix”也早已有商业先例 |
| 2017 | 开源项目 `mordechaim/Mosaic` 实现同一规则 | 后来 Simon Tatham 版本所参考的免费数字实现之一 |
| 2017–2018 | 《Fill-a-Pix: Phil's Epic Adventure》在 3DS、Switch、PS4、Vita 等平台发行，支持可滚动、最宽 100 格的大题 | 证明“在数字界面中滚动画大图”不是新点子 |
| 2021-04-25 | Simon Tatham's Portable Puzzle Collection 加入 Mosaic | 《Proverbs》开发者明确提到自己玩过的直接灵感来源，最高可设 50×50 |
| 2024-05-02 | 同一开发者发布《Mega Mosaic》：一张 250×250、62,500 格的单体谜题，完成子区域揭示像素画 | 证明“单张超大画布＋分区＋揭画”在《Proverbs》之前已经存在，且格数还更大 |
| 2024-11-07 | 《Proverbs》正式发布 | 把框架改造成 259 个不规则自封闭区域，并绑定一张历史名画和谚语内容 |
| 2025-11 后 | Android《Mosaic of Signs》采用 37,000+ 单体谜题和同样 3×3 亮格计数，完成后揭示星座与神话内容 | 较晚出现的同类，说明这种“巨幅 Mosaic＋主题知识解锁”已经形成可辨识的子类型，但不能作为《Proverbs》之前的先例 |

谱系的主要一手来源：

- [Conceptis：Fill-a-Pix 官方规则](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules)：明确 3×3、计入数字格自身、逻辑解与隐藏图像；
- [Conceptis：Fill-a-Pix 官方历史](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/history)：记录 Trevor Truran 的构思、2001 年原型与 2003 年推出；
- [Conceptis：2017 年 Mega Mosaik](https://www.conceptispuzzles.com/index.aspx?uri=info/news/479)：60×100 纸质大题；
- [`mordechaim/Mosaic` 源代码仓库](https://github.com/mordechaim/Mosaic)：README 给出同一规则，仓库历史始于 2017 年；
- [Simon Tatham Mosaic 官方手册](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mosaic.html)：明确规则、别名和对 `mordechaim/Mosaic` 的参考；
- [Simon Tatham 官方 Git 提交 `0377184`](https://git.tartarus.org/?p=simon/puzzles.git;a=commit;h=0377184510629b15814e3fd6c9f0f1d9e58b9209)：2021-04-25 加入 Mosaic；
- [《Mega Mosaic》Steam 官方页](https://store.steampowered.com/app/2915950/Mega_Mosaic/)：250×250、单张巨幅谜题、子区域揭画；
- [Lightwood Games《Phil's Epic Adventure》官方页](https://www.lightwoodgames.com/fill-a-pix-phils-epic-adventure/)与[任天堂官方页](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-download-software/Fill-a-Pix-Phil-s-Epic-Adventure-1397444.html)：商业数字版大题；
- [《Mosaic of Signs》Google Play 官方页](https://play.google.com/store/apps/details?id=com.juvelop.mosaicofsigns)：较晚出现的 37,000+ 主题化巨幅同类。

## 5. 开发者本人如何描述来源

在开发者访谈中，Mark Ffrench 给出了非常直接的来源链：

1. 他玩过 Simon Tatham 的 Mosaic，常规最大尺寸为 50×50；
2. 他想把这种体验做得“大得多”；
3. Reddit 的 r/place 给了他“巨幅像素画协作拼成整体”的空间想象；
4. 先做出《Mega Mosaic》，再在《Proverbs》中去掉区域隔墙、改用不规则自封闭小题；
5. 他明确表示，**不主张对所使用的谜题机制拥有所有权**。

这段自述与可核验时间线完全一致，因此“《Proverbs》发明了扫雷＋数织规则”的说法没有证据基础。来源：[Mark Ffrench 访谈全文](https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench)。

## 6. 市面上最接近的同类

### A. 同一底层规则，早于《Proverbs》

- **Conceptis Fill-a-Pix**：该类型的标准商业名称与长期产品线，包含 Basic、Advanced、Mega 等尺寸/难度。
- **Simon Tatham's Mosaic**：免费、可参数化、可反复生成的纯逻辑版本，也是开发者承认的直接灵感。
- **Fill-a-Pix: Phil's Epic Adventure**：把大尺寸 Fill-a-Pix 做成主机上的滚动画面与照片揭示体验。
- **Mega Mosaic**：与《Proverbs》血缘最近；同一开发者、相同核心规则、同样是单张巨幅画布、分区完成、像素画解锁。

### B. 同一开发者后续形成的系列

[Mark Ffrench 官方作品页](https://www.markffrench.com/)还列出《2024: A Mosaic Retrospective》《Mosaic of the Pharaohs》《Mosaic of the Strange》《2025 Retrospective》等。它们继续沿用“一个长期巨幅 Mosaic＋主题画作/叙事”的产品框架，说明《Proverbs》更适合被看成一个持续发展的 **Mega Mosaic 系列节点**，而非孤立发明的新规则。

### C. 较晚出现的独立近似产品

**Mosaic of Signs** 在 Android 上把 37,000+ 单体盘面、3×3 亮格计数、星空图像和星座神话知识结合起来。它晚于《Proverbs》，不能削弱《Proverbs》在 2024 年具体主题组合上的先发性，但可以证明这套结构能够被其他开发者识别并复用。

## 7. 原创性拆解判定

| 维度 | 判定 | 证据 |
|---|---|---|
| 3×3 邻域计数、0–9、计入自身 | **明确非原创** | Fill-a-Pix 至少于 2003 年正式推出 |
| 纯逻辑二值填格 | **明确非原创** | Fill-a-Pix、Mosaic 均已有 |
| 完成填格后得到图片 | **明确非原创** | Fill-a-Pix 的类型定义本身就是 picture-forming |
| 大尺寸、滚动画布 | **明确非原创** | 2017 Mega Mosaik、2017/18 Phil's Epic Adventure |
| 单张数万格的超大谜题 | **不是《Proverbs》首创** | 同作者《Mega Mosaic》先以 62,500 格发布 |
| 分区完成后另行揭示彩色像素画 | **不是《Proverbs》首创** | 《Mega Mosaic》官方页已明确“完成子区域揭示像素画” |
| 无隔墙的不规则、自封闭区域逻辑 | **有明确的改造性新意** | 开发者说明这是从《Mega Mosaic》到《Proverbs》的结构变化；本次未找到更早的完全同构产品 |
| 一整幅历史名画＋区域谚语释义＋寻找细节 | **高度有辨识度的内容组合** | 官方页面、原作主题与成就结构共同支持 |
| “解谜二值答案”与“最终彩色画面”相分离 | **相对传统 Fill-a-Pix 的重要差异，但未证明首创** | 开发者确认答案由随机噪声生成；《Mega Mosaic》已经使用分区揭画框架 |
| 整套产品是否世界首创 | **不能下此结论** | 未检出更早完全相同组合，不等于不存在；官方也没有可核验的首创声明 |

## 8. 最终表述建议

如果需要用一句准确而不过度营销的话介绍它，可以写：

> 《Proverbs》不是新发明的“扫雷＋数织”规则，而是一款把经典 Fill-a-Pix/Mosaic 做成 54,488 格长篇画布的主题化作品：259 个不规则、自封闭逻辑区逐步解锁老勃鲁盖尔《尼德兰箴言》的彩色像素画、谚语和解释。其原创性主要在超长篇结构、区域规则改造和历史内容编排，而不在底层邻域计数机制。

更短的原创性结论：

> **核心玩法非独创；超大单画布也非首创；但“不规则自封闭分区＋整幅历史名画＋谚语微百科”的具体组合具有很强的独特执行。**

## 9. 检索边界

本次优先核查了游戏官网、Steam、开发者主页与访谈、Conceptis 官方历史、任天堂与 Lightwood 产品页、原始代码仓库及当前应用商店条目。它足以否定“核心规则独创”和“首次做巨幅单盘”这两个强主张。

不过，对“是否从来没有任何更早作品采用完全相同的不规则区域处理”这类全球性否定命题，公开网页检索无法穷尽早期纸质谜题、小语种出版物、下架移动应用和未公开原型。因此本文只给出“本次未检出更早完全同构产品”，不把搜索空白包装成世界首创证明。
