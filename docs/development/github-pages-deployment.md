# GitHub Pages 部署契约

状态：已上线；HTTPS 可访问，强制 HTTPS 跳转待启用  
目标站点：`https://game.onovich.com/King-Varos-Table/`

## 发布边界

- `.github/workflows/deploy-pages.yml` 在 `main` 更新时安装 MiniZinc 并运行完整自动化测试，只在唯一性集成检查与其余测试全部通过后发布。
- Pages artifact 只包含 `web/`；研究资料、生成工具、测试、MiniZinc 模型以及本地临时目录不会成为公开网站内容。
- 当前站点没有构建步骤。HTML、CSS、JavaScript 模块和公开关卡 JSON 直接从 `web/` 发布。
- 游戏发布在 `game.onovich.com` 的 `/King-Varos-Table/` 项目目录。该域名还承载其他游戏，不得将本仓库绑定到域名根路径或改动个人站点配置。
- 静态资源与关卡载入使用相对路径，必须同时兼容本地 `web/` 根目录和线上项目子目录。

## GitHub 与 DNS 设置

1. 仓库 `onovich/King-Varos-Table` 的 Pages 发布源使用 **GitHub Actions**。
2. 保持本仓库 Pages 的 Custom domain 为空。现有账户级路由已将本项目映射为 `game.onovich.com/King-Varos-Table/`；以 Pages API 的 `html_url` 核对最终地址。
3. 复用现有 DNS：`game.onovich.com` 的 `CNAME` 指向 `onovich.github.io`。本项目无需新增或修改 DNS。
4. 证书可用后，在本仓库启用 **Enforce HTTPS**。

自定义 GitHub Actions 发布不会使用仓库里的 `CNAME` 文件。不要为修复访问问题而把 `game.onovich.com` 填入本仓库的 Custom domain：那会将共享域名根路径绑定给单个游戏，影响其他项目。

## 验收

- Actions 的 `validate` 与 `deploy` 任务均成功。
- `https://game.onovich.com/King-Varos-Table/` 返回游戏页面。
- `https://game.onovich.com/King-Varos-Table/?mode=puzzle` 能载入可玩棋盘及关卡 JSON。
- 页面资源无 404，浏览器控制台无模块或跨源错误。
- 本项目 HTTP 地址自动跳转到 HTTPS。
- `https://game.onovich.com/GameLetter/` 等已有项目继续可访问。

## 首次发布记录（2026-09-07）

- 发布提交：`73bf1374846ba6099a938e2a59517e93c85cb724`。
- [GitHub Actions 首次部署](https://github.com/onovich/King-Varos-Table/actions/runs/34074584972) 的 `validate`、`deploy` 均成功；包含 MiniZinc 的完整测试共 60 项，全数通过。
- `web/` 中全部 19 个已提交文件在线返回 HTTP 200；逐文件 SHA-256 与提交内容一致。HTML、模块、CSS、图标和关卡 JSON 的 Content-Type 正确。
- Codex 侧边浏览器成功进入 `?level=first-light` 的 6×6 首关。点击提示后，R1C1 的数字 4 强高亮，同国范围内其余 3 格弱高亮；浏览器未记录错误或警告。
- `https://game.onovich.com/GameLetter/` 仍返回 HTTP 200；没有修改共享域名、DNS 或其他项目配置。
- 本次仅发布已提交的可玩版本；本地未提交的世界地图界面及相关设计文件不在发布提交内。
- 剩余配置：本仓库 `https_enforced` 仍为 `false`，HTTP 暂不自动跳转。证书已可用，但未在尚未登录的侧边浏览器中改动设置；后续登录后启用，或在用户同意改用已登录的 GitHub CLI 后处理。直接使用上方 HTTPS 地址即可安全访问。
