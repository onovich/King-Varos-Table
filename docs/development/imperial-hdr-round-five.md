# HDR / PBR 第五稿 — 2026-09-08

## 已实现

Blender 5.2.1 LTS 在与宴厅同尺寸、同窗位的静态灯光代理场景生成 1024×512 RGBE HDR，以及 1024×1024 桌面 DIFFUSE INDIRECT 与 AO 烘焙。使用真实器物 GLB、桌面尺寸和坐标；房间、柱、烛台用简化几何。烘焙不包含烛火直射，实时烛火仍独立变化。

后台使用 BelowNormal、两个逻辑处理器、两个 CPU 渲染线程、32 samples；用时 127.53 秒。未启用 GPU 离线渲染，Blender 已正常退出。

运行时使用同版本 Three.js 0.185.1 HDRLoader（同目录 MIT LICENSE），加载时 PMREM 预过滤并释放原始 HDR GPU 纹理。HDR 中窗亮度峰值约 5.49、平均 RGB 亮度约 0.0614，保留超过 1 的数据。Blender 窗位在全景 u=.5，Three equirect atan(z,x) 将其解释为 +X，因此环境旋转 +π/2 对应世界后墙 -Z；代码和回归测试覆盖此变换。

桌面增加位于 y=2.981 的光照接收面，使用独立 uv1：u=x/12+.5，v=z/19+.5，与 Blender 烘焙坐标一致。颜色贴图保留 sRGB；AO/lightMap 保持 NoColorSpace，防止 gamma 二次转换。只有使用 Blender 器物时启用匹配的静态烘焙。

墙体、石材、木材、纸面、普通金属改用 MeshStandardMaterial。瓷釉、布料和透射液体仍保留需要的物理效果。没有添加实时反射探针、实时光追或额外阴影灯。

## 资源与重建

```powershell
./tools/Build-BlenderTableware.ps1 -Study Lighting
python tools/pack_lighting_bakes.py
```

生成脚本为 tools/bake_imperial_lighting.py。打包脚本用轻微空间滤波处理低采样噪声，转为 8-bit 线性 WebP（编码无损，但相对浮点烘焙有量化/滤波变化），保留 1K 尺寸，移除可重建的中间 PNG。源脚本、处理参数、文件大小与烘焙时间保留在 assets/baked-lighting/bake-manifest.json。

| 运行资源 | 字节 |
| --- | ---: |
| imperial-room-1k.hdr | 1,223,494 |
| table-ao.webp | 467,698 |
| table-indirect.webp | 442,434 |
| 合计 | 2,133,626（约 2.03 MiB） |

两张 1K 贴图若以 RGBA8 + mipmap 展开，理论占用约 10.7 MiB；下载体积不能代表显存。PMREM 替换原有程序环境，具体显存、帧率和 GPU 耗时尚未实测。运行页面 FPS 节点增加只读 dataset：renderSubmissionMs、calls、triangles、textures、lighting。renderSubmissionMs 是 JS 渲染提交时间，不是 GPU 完整帧耗时。

## 对照与验证状态

默认入口启用 HDR；`?lighting=legacy` 还原简化环境光且不使用烘焙桌面，两种模式共享本轮材质简化，以隔离环境光/烘焙开销。`?craft=classic` 使用旧器物，此时不套用 Blender 器物的接触烘焙。

完整 85 项 unittest 通过，包括真实 HDRLoader 动态范围/尺寸检查、uv1 世界坐标对齐、环境旋转与本地 WebP 文件检查。原有 28 张无损图片像素检查通过。HTTP 确认入口、HDR 与两张 WebP 全部 200。git diff --check 通过。

**未完成实际浏览器视觉与性能验收。** CUA 工具在页面导航前报告 `failed to write kernel assets` / 路径不存在，重置、重新连接和核对本地运行路径后仍失败。不能将旧稿 60 FPS 或离线预览当作第五稿实测。本轮没有实时截图；hdr-preview.jpg 是离线 HDR 的压缩动态范围显示图。

界限：单个环境探针无逐物体视差校正；代理烘焙不是完整房间 GI，且依赖静态摆放。移动器物需要重新烘焙。不得宣称已经达到写实品质或性能目标。本轮未推送、未部署。
