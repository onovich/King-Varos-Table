# 古典地中海宴厅重制 · 2026-09-09

正式本地入口：http://127.0.0.1:4188/?revision=9&level=inner-sea-journey-v1

本轮未推送或部署。没有修改谜题、地区归属、剧情文本或游戏存档格式。

## 交付

- 普通椅与王座分别重新建模：贯通后立柱、前腿、下横撑、座框、实木嵌板靠背、直接支承扶手。去除椭圆软包与御座圆环。七席共享普通椅几何与材质。
- 席位使用 `seat-layout.mjs` 的局部坐标，统一杯、盘、酒液、餐巾与餐具朝向。测试加载完整 GLB 包围盒，七席杯盘净空均大于盘径 8%。
- 现代叉子换为青铜餐匙、餐刀；牛角包换为分瓣圆面包，Blender 烘焙 512px 麦皮纹理。原有水果及木桌纹理保留。
- 吊灯改为四根斜向吊杆支承的青铜灯盘框。蜡口、蜡滴、烛芯随烛身使用同一升高量，移除旧坐标残件。
- 正式菜单新增“光影编辑”，含 10 个实际光源及 HDR、烘焙间接光、发光贡献三项。支持实时调整、单光源、恢复默认、保存、JSON 导入导出；保存键为 `varos-lighting-v1`。
- 默认配置见 `web/prototypes/imperial-table/assets/default-lighting-v1.json`，由实际面板导出。稳定 ID，版本 1；异常或重复 ID、版本不符、非法颜色、非有限数值、超范围参数等拒绝导入，保留之前配置。
- 烛火闪烁同步作用于火焰、照明强度、光源位置及动态阴影。划过的方向与速度产生衰减微风，约 0.8 秒消散；静止、拖动、菜单与调光操作不触发。减少动态效果的默认值关闭持续动态，编辑器可主动开启。
- 桌面最多两盏 512 阴影、15 Hz；窄屏一盏 256、10 Hz。静止时不重复更新不变的阴影。高窗阴影缓存，调整光源或分辨率时强制更新。
- 聚焦由正式 `activeRegionId` 驱动，共享格子归属遮罩。非活动纸面 28%、棋盘 20% 的最终画面亮度，数字再降低为 60% 图层贡献；250ms 过渡，半格以内边缘软化。家具不受遮罩影响。地区中心取景、切区不落笔、总览显式恢复、缩放阈值滞回均保留。

## 模型构建

`powershell -NoProfile -File tools/Build-BlenderTableware.ps1 -Study Furniture`

Blender 5.2.1 LTS；无头隐藏窗口、BelowNormal、两线程、处理器亲和性 3。已实际成功重建并核查导出文件：

| 文件 | 字节 |
| --- | ---: |
| imperial-chair.glb | 430140 |
| imperial-throne.glb | 496440 |
| round-bread.glb | 573420 |

普通椅与王座各三批材质；圆面包一个网格。旧的 `chair-proof.jpg` 属于第六轮历史素材，不用于本轮验收。本轮验收使用下方正式游戏的整体实时画面。

## 验证

`python -m unittest discover -s tests`：**94 项通过**，MiniZinc 已加入测试 PATH。

新增针对蜡烛全部部件归属与支承面、完整杯盘模型净空、独立王座尺度、配置往返与拒绝异常、参数排序、静止/划过判定、阴影预算、光源随风位移、阴影更新、遮罩归属及过渡、边界中心与阈值滞回的测试。原有正式会话、谜题与存档测试全部通过。

浏览器实际操作验证：

- 新旅程进入引导；暗格标记进度 0→1，撤销 1→0，重做 0→1；刷新并“回忆往昔”读回 1/48。随后擦除测试标记、跳过引导。
- 佩尔岛聚焦；总览恢复全图亮度；切换阿斯帕并居中，进度仍为 0/102，未同时落笔。
- 调光实时开关、视角切换、默认恢复、本地保存、JSON 导出、正常导入、错误版本拒绝。
- 烛光开启/关闭实际画面对比。相同纸面区域 RGB 均值约从 `[222,187,129]` 降为 `[91,78,57]`，局部照明存在感明确；金属和纸面同步响应。
- 全局烛光动态开关可以在静止与闪烁之间切换。实际指针划过火焰，事件计数递增至 2。前后截图包含微风与自发闪烁的共同变化，不把差异完全归因于微风。
- 1440×900、1280×720、390×844、320×740：七区入口、工具栏、取景和调光面板可用；窄屏调光面板可滚动，关闭按钮保持可达。
- 修复实测发现的两项问题：重开旅程复用旧海图 shader uniforms；跨桌面/窄屏切换阴影尺寸后缓存未重绘导致发黑。

性能为本机 Codex Chromium 内嵌浏览器的短窗口采样，**不是移动设备实测**。系统为 Ryzen 7 9700X，安装 RTX 5070 Ti 与 AMD 集显；未单独确认浏览器实际选用的 GPU。桌面稳定画面约 60 FPS，取景/切换时观察到 57 FPS；窄屏模拟约 60 FPS。普通帧约 277–1294 次绘制，阴影更新帧可到 1353–3295 次。仍需低端 GPU 和真实触屏设备验证，不据此宣称移动端达标。

## 实际截图

- [宴席远景](screenshots/hall-remake-banquet.png)
- [全图俯视](screenshots/hall-remake-overview.png)
- [地区及器物近景](screenshots/hall-remake-focus.png)
- [光影编辑](screenshots/hall-remake-editor.png)
- [烛光开启](screenshots/hall-remake-lights-on.png) / [关闭](screenshots/hall-remake-lights-off.png)
- [静止](screenshots/hall-remake-static.png)
- [划过之前](screenshots/hall-remake-wind-before.png) / [之后](screenshots/hall-remake-wind-after.png)
- [1280](screenshots/hall-remake-1280.png)、[390](screenshots/hall-remake-390.png)、[320](screenshots/hall-remake-320.png)
