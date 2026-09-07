# GitHub Pages 部署契约

状态：已配置，等待远端首次部署验收  
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
