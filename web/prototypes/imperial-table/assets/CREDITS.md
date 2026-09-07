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
