# 第三稿资产来源

以下资产来自 Poly Haven，采用其 **CC0 1.0** 授权，文件已经完整保存到本地。运行试稿不请求第三方 CDN。下载后逐文件校验了源 API 提供的 MD5。

| 资产 | 本地文件 | 来源 |
|---|---|---|
| Dark Wood：颜色、OpenGL 法线、粗糙度，2K | `wood-color.jpg`、`wood-normal.jpg`、`wood-roughness.jpg` | https://polyhaven.com/a/dark_wood |
| Food Apple 01：网格及 2K 材质 | `food_apple_01/` | https://polyhaven.com/a/food_apple_01 |
| Food Pomegranate 01：网格及 2K 材质 | `food_pomegranate_01/` | https://polyhaven.com/a/food_pomegranate_01 |
| Croissant：网格及 2K 材质 | `croissant/` | https://polyhaven.com/a/croissant |

授权说明：https://polyhaven.com/license 。原始资产元数据保留在 `*-files.json`，以便复核。

Three.js 0.185.1 的 GLTFLoader、BufferGeometryUtils、SkeletonUtils 也随项目保存；只将导入路径改为本地相对路径，遵循 `vendor/LICENSE` 中的 MIT 许可证。

海图为第二稿内置 imagegen 生成的资源，见 [生成记录](PROMPT.md)。御座、建筑、器皿、蜡烛与火焰为当前试稿的代码资产。

本轮检查 PATH、常用安装目录及 D 盘后没有定位到本机 `blender.exe`，未安装额外 Blender，也未声称使用 Blender 导出。此次采用扫描 glTF 资产改善食物品质；保留实时 Three.js 镜头、棋盘与照明。
# 无损格式优化

2026-09-08：本地海图由 PNG 转为无损 WebP，尺寸、解码后的 RGBA 像素和 ICC 配置保持一致；图像生成来源不变。扫描资产及其 JPG 贴图未重新编码，原有资源校验记录仍适用。详细记录见 `docs/development/image-optimization.md`。
# Blender 原创器物

`blender-tableware/charger.glb`、`goblet.glb`、`napkin.glb` 与 `proof.jpg` 为本项目脚本在 Blender 5.2.1 中生成的器物与离线样张，不使用第三方扫描资产或贴图。可由 `tools/build_blender_tableware.py` 重建；与上方 Poly Haven 授权范围分开。Blender 安装检查与实际调用记录见 `docs/development/blender-tableware-study.md`。
# 整体第四稿帷幕

`blender-hall/drapery.glb` 为项目脚本 `tools/build_blender_hall.py` 在 Blender 5.2.1 无头生成的原创几何与原生材质，不含外部图片或资产。使用 `tools/Build-BlenderTableware.ps1 -Study Hall` 可重建；约 0.76 MiB。
# HDR 与静态烘焙（第五稿）

`baked-lighting/` 为项目脚本在 Blender 5.2.1 中生成的室内 HDR 与桌面间接光/AO，不使用外部 HDR 图库。器物输入来自本项目 Blender 原创器物。生成与处理参数见该目录 `bake-manifest.json`，重建脚本为 `tools/bake_imperial_lighting.py` 和 `tools/pack_lighting_bakes.py`。`hdr-preview.jpg` 只是 HDR 的显示预览。

新增 `vendor/HDRLoader.js` 来自 Three.js 0.185.1 官方 npm 包，沿用该目录 MIT LICENSE；仅将 `three` 导入改为本地路径。使用当前 HDRLoader，不引入已经弃用的 RGBELoader 包装器。


### Blender furniture (round six)
`blender-furniture/imperial-chair.glb` and `chair-proof.jpg`: original procedural assets generated locally by `tools/build_blender_furniture.py`, Blender 5.2.1 LTS. No third-party models or textures. Proof image is an offline CPU render.


### Atlas revision seven
`sea-chart-v7.webp`: OpenAI image generation, created 2026-09-08 using `atlas-layout-guide.png` (project-generated public region layout) as reference. Original generated PNG retained in the local Codex generated_images directory. WebP quality 90, no added runtime dependencies. Hand-drawn artwork boundaries approximate the grid ownership; the runtime UV calibration maps the engraved field onto the square-cell board.

### Classical hall remake (round nine)
`blender-furniture/imperial-chair.glb`, `imperial-throne.glb`, `round-bread.glb`: original project models and procedural baked crust, generated locally with Blender 5.2.1 LTS by `tools/build_blender_furniture.py`. No external model, texture or paid service. Round six chair proof is historical; current acceptance images are real browser screenshots in `docs/development/screenshots/hall-remake-*`.

### Dining hall revision ten
`blender-furniture/imperial-throne.glb`: independently redesigned imperial dining chair with timber panels, ivory-toned inlays and a projecting cornice. Original procedural project asset generated headlessly with Blender 5.2.1 LTS, BelowNormal priority and two threads. Six side seats share the ordinary chair model. Browser acceptance screenshots: `docs/development/screenshots/dining-ui-10-*`.

### Seating revision eleven
Original project geometry rebuilt with headless Blender 5.2.1 LTS: turned posts, framed panels, restrained imperial inlays and a small timber relief. Runtime wood/cloth maps reuse existing credited materials; no museum photographs or copied mesh assets are embedded. Historical rationale and limitations: `docs/development/seating-cultural-remake.md`. Previous chair proof images are historical.

### Seating revision twelve
Original headless Blender models resized by component: adult seat width/depth, higher backs, integrated ivory-toned palmette frieze and textile backs. Measurement and acceptance record: `docs/development/seating-proportions-12.md`.
