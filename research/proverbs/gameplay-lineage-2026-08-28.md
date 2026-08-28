# 《Proverbs》核心玩法溯源

日期：2026-08-28

## 结论

《Proverbs》的核心规则不是从扫雷直接演化而来。当前证据支持两条相互衔接、但性质不同的来源链：

1. **《Proverbs》的直接产品谱系**

   《Proverbs》 ← Mark Ffrench 的《Mega Mosaic》 ← Simon Tatham's Portable Puzzle Collection 中的《Mosaic》

   Mark Ffrench 明确表示，他长期游玩 Simon Tatham 的《Mosaic》，觉得最大 50×50 仍不够大，因此想做一个能持续数周、规模极大的单盘谜题。随后先做出 250×250 的《Mega Mosaic》，再在《Proverbs》中移除规则区域之间的一格宽隔离带，并把各个不规则区域设计成可独立求解。

2. **这套邻域计数规则的历史谱系**

   《Mosaic》／《Fill-a-Pix》 ← Conceptis 在 2003 年商品化的《Fill-a-Pix》 ← Trevor Truran 在 1970 年代末提出的 “internal-referencing” 邻域计数谜题

   Trevor Truran 的早期规则已经是：格中的 0–9 表示“自身和周围邻格”中满足条件的格子数量。最初的原型并不一定生成像素画，后来才发展成填色后显露图像的形式。Truran 在 2001 年末将原型交给 Conceptis；Conceptis 继续开发，并于 2003 年 2 月正式公布《Fill-a-Pix》。

因此，**目前能可靠追溯到的最早玩法祖先，是 Trevor Truran 在 1970 年代末设计的邻域自指计数谜题**；他本人又受到 John Conway 的《生命游戏》中“一个格子及其邻居”思想的启发。《生命游戏》只是概念启发，并不是相同玩法的纸笔谜题。

## 关键时间线

| 时间 | 事件 | 与《Proverbs》的关系 |
| --- | --- | --- |
| 1970 年代末 | Trevor Truran 构思“internal-referencing”谜题；数字描述自身及邻格 | 当前可查到的规则源头 |
| 2001 年末 | Truran 将粗略原型交给 Conceptis 的 Dave Green | 进入系统化开发阶段 |
| 2003 年 2 月 | Conceptis 公布《Fill-a-Pix》 | 规则家族正式商品化、定名 |
| 后续 | 同类谜题以 Mosaic、Nurie-Puzzle、Mosaik 等名称传播，并出现开源数字实现 | Simon Tatham 版本属于这条规则家族 |
| 2024-05-02 | 《Mega Mosaic》发布：单张 250×250 大盘，0–9 邻域计数，完成分区后显露像素画 | 《Proverbs》的直接前作 |
| 其后 | 《Proverbs》去掉《Mega Mosaic》的一格宽分区隔离带，采用可独立求解的不规则区域 | 在祖传规则上的结构改造 |

## 与扫雷、数织的关系

- **扫雷**和它都使用邻域数字，因此视觉直觉相近；但扫雷数字描述周围地雷，通常不包含数字格自身，而且线索随开格出现。它不是当前证据支持的直接祖先。
- **数织／Nonogram／Picross**和它都可能最终显露像素画；但数织使用整行、整列的连续段长度，约束结构完全不同。目前也没有证据表明《Proverbs》直接从数织继承规则。
- “扫雷 + 数织”适合用作通俗类比，不适合当作严谨的玩法谱系。

## 证据强度与保留意见

- **直接继承《Mosaic》：高可信。** 开发者 Mark Ffrench 以第一人称明确说明了游玩《Mosaic》后制作超大版本的动机。
- **《Mega Mosaic》是直接前作：高可信。** Steam 官方产品页和开发者说明的规则、作者、时间及区域结构能够互相印证。
- **Trevor Truran 是该规则的发明者：较高可信。** Conceptis 官方将其列为发明者，并给出从 1970 年代末到 2003 年的完整开发叙述；Simon Tatham 的规则文档和相关开源实现也沿用这一归属。
- **“全球绝对最早”：不能完全证明。** 现有资料主要是后来的官方回顾，而不是一份可独立查验的 1970 年代原始出版物。因此更严谨的说法是“目前可可靠追溯的最早来源”，不应宣称已经排除所有更早、未数字化或未留档的纸笔谜题。

## 一手及高可信来源

- Conceptis，《Fill-a-Pix history》：https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/history
- Conceptis，《Fill-a-Pix rules》：https://www.conceptispuzzles.com/index.aspx?uri=puzzle/fill-a-pix/rules
- Simon Tatham's Portable Puzzle Collection，《Mosaic》规则文档：https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mosaic.html
- Mark Ffrench 开发者访谈：https://www.thegeeklygrind.com/all-posts/mosaic-of-the-strange-interview-with-developer-mark-ffrench
- Steam，《Mega Mosaic》官方商店页：https://store.steampowered.com/app/2915950/Mega_Mosaic/
- mordechaim/Mosaic 开源实现：https://github.com/mordechaim/Mosaic

