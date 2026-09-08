# Blender 无头器物试验 — 2026-09-08

本机 Blender 5.2.1 LTS 位于 `D:/Programs/Blender/blender.exe`。本轮实际完成无头建模、GLB 导出、Cycles CPU 离线样张和 Three.js 加载；此前未找到 Blender 的记录属于第三稿当时的环境情况。

## 执行与隔离

使用 `tools/Build-BlenderTableware.ps1` 启动：`--background --factory-startup --threads 2 --python-exit-code 1`，Windows 隐藏窗口、BelowNormal 优先级、最多两个逻辑处理器。Cycles 显式使用 CPU、24 samples、900×700、降噪，不占用 GPU 渲染。渲染完成后 Blender 退出；不修改用户偏好，不操作已有 Blender 窗口。后台网页验证结束后关闭试验页，避免持续 WebGL 绘制。

```powershell
./tools/Build-BlenderTableware.ps1
# 其他机器可显式指定：
./tools/Build-BlenderTableware.ps1 -BlenderPath 'C:/Program Files/Blender Foundation/Blender/blender.exe'
```

生成源码是 `tools/build_blender_tableware.py`。没有外部模型下载、付费资产或插件；输出为三份自制 GLB 和一张小型 JPEG 样张，不保存重复的大型 .blend。脚本可重新生成模型。

## 实际内容

- 瓷盘：闭合厚度、平滑盘沿、细金边与釉面材质。
- 酒杯：平滑连续剖面、杯壁、杯脚与凹槽高光；保留原有实时酒液。
- 餐巾：带厚度的薄布面、非等距褶皱与束环；实际摆放移到席位外侧，避开地图。

三个模型合计 1,205,332 字节（约 1.15 MiB），七席共享 geometry/material。默认视图仍使用原器物，只有 `?craft=blender` 加载新 GLB；通过 `blender-review.html` 比较。正式游戏业务和存档不变。

## 结果与判断

81 项自动测试通过，其中新增使用真实 GLTFLoader 读取三份 GLB、尺寸/桌面高度/法线有效性/单模型体积检查。28 张前轮无损图片像素校验保持通过。浏览器实际进入新器物版远景、总览和阿斯帕近景；修正后总览确认餐巾不再遮挡海图。短时桌面读数约 60 FPS，不作为手机硬件性能结论。

值得保留的是器物闭合轮廓、杯壁和薄布面建模流程。尚未解决的是房间整体材质与建筑精细度、餐巾程序化褶皱感、金属微划痕及更可信的液体表现。Blender 离线样张使用独立灯光与 Cycles，不能等同于 Three.js 实时画面。先保留对照入口，不据此宣称全场景达到写实品质。

原 4175 预览服务本轮已不在运行，临时启动仅绑定 localhost 的 4188 静态预览服务。入口：`http://127.0.0.1:4188/prototypes/imperial-table/blender-review.html`。本轮未提交或推送。
