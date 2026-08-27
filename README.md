# LearnProverbs

一个从研究材料接手的 Proverbs 核心玩法原型：巨型画布被切成互不串线的不规则区域，每个区域使用 Fill-a-Pix / Mosaic 式的 3×3 计数线索。当前用 20×20 棋盘和四个大区域验证玩法闭环，区域形状与内容编排暂时保持简单。

## 已完成的接手范围

- 研究与交接资料保留在 [`PROVERBS_HANDOFF.md`](PROVERBS_HANDOFF.md) 和 [`research/`](research/)；目标游戏确定为 Proverbs，而不是传统扫雷。
- 已初始化本地 Git 仓库，默认分支为 `main`，当前没有远端推送操作。
- `proverbs/` 提供区域邻域、线索计算、严格单线索求解器、进阶分析器和关卡生成器。
- `models/region_unique.mzn` 用 MiniZinc 检查“是否存在一个不同于目标答案的第二解”。
- `web/` 是可直接运行的浏览器原型：左键标亮、右键或 Shift+点击标暗；提示器每次按玩家当前盘面重算，只选择一个可直接结算的数字，强高亮该数字并弱高亮其同区域 3×3 有效范围。
- “清除错误答案”会从公开线索重建唯一答案，一次移除全部错误标记，同时保留正确标记和未知格；公开 JSON 仍不包含隐藏答案。
- 公开关卡必须能从空盘一路使用上述基础提示完成；当前示例关卡的 `reasoningLevel` 为 `basic`，不会在中途隐式升级为双线索差集。
- `web/data/demo-level.json` 是公开题面，故意不包含隐藏答案。
- 提示、布局与纠错功能的防回归约束记录在 [`HINT_SYSTEM_GUARDRAILS.md`](HINT_SYSTEM_GUARDRAILS.md)。

## 运行

在项目根目录执行：

```powershell
npm start
```

然后打开 <http://localhost:4173/>。也可以直接使用：

```powershell
python -m http.server 4173 --directory web
```

重新生成关卡（默认会调用本机 MiniZinc）：

```powershell
npm run generate
```

`--skip-minizinc` 只适合生成器本地迭代；交付关卡应保留默认的严格唯一性验证。

## 生成与验证管线

```text
区域 mask
  → 区域内亮暗各半的平滑随机场答案
  → 按同区域 3×3 邻域计算完整线索
  → DirectClueSolver 验证单数字基础推理链
  → 随机顺序贪心删线索（每次删除后重新验证完整基础推理链）
  → MiniZinc 阻塞目标答案，证明不存在第二解
  → 导出不含答案的公开 JSON
```

这里的两个保证有意分开：

- `DirectClueSolver` 只对题面原有数字使用“剩余数为 0 / 等于未知数”，与网页“给我一个必然步骤”的可解释范围完全一致；它不试填、不回溯、不生成差集约束。
- `NoGuessSolver` 仍保留双线索集合差集，供研究和高级难度分析使用，但其结果不再单独构成公开关卡“基础无猜”的验收依据。
- MiniZinc 负责数学层面的严格唯一性；如果超时或得到 `UNKNOWN`，生成流程会报错，不会把它当作唯一解。

## 目录

```text
models/region_unique.mzn       MiniZinc 唯一解模型
proverbs/solver.py             单线索求解与进阶约束传播
proverbs/level.py              区域、线索、生成与导出
proverbs/minizinc_check.py     MiniZinc 子进程桥接
tools/generate_level.py        关卡生成 CLI
tests/test_proverbs.py         领域逻辑与 MiniZinc 集成测试
web/index.html                 原型页面结构
web/styles.css                 版画/档案册视觉样式
web/app.js                     浏览器状态与提示器
```

## 当前边界与下一步

- 四个区域是确定性 Voronoi 风格的示例分区，尚未接入真正的人工区域编辑器。
- 目标图案当前按区域生成接近 1:1 的亮暗分布，并要求公开线索覆盖 0—9；尚未处理最终彩色插画与逻辑答案的内容对齐。
- 浏览器默认提示与生成验收共享“单个数字直接结算”的严格规则；高级差集分析保留为内部能力，尚未重新设计成玩家可读的可选提示模式。
- 下一阶段可以增加区域编辑/导入、可选高级模式、重复删线索优化，以及按首步数量和推理深度分层的关卡筛选。

## 验证

```powershell
npm test
```

当前测试覆盖：区域边界裁剪、四区 mask、基础与高级推导的边界、MiniZinc 第二解判定、真实关卡生成的公开答案隐藏与唯一性证明、网页提示从空盘连续走完 400 格、提示布局稳定性，以及错误标记的精确清理。
