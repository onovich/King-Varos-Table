# GitHub Pages 部署契约

状态：已配置，等待远端首次部署验收  
目标站点：`https://game.onovich.com/`

## 发布边界

- `.github/workflows/deploy-pages.yml` 在 `main` 更新时安装 MiniZinc 并运行完整自动化测试，只在唯一性集成检查与其余测试全部通过后发布。
- Pages artifact 只包含 `web/`；研究资料、生成工具、测试、MiniZinc 模型以及本地临时目录不会成为公开网站内容。
- 当前站点没有构建步骤。HTML、CSS、JavaScript 模块和公开关卡 JSON 直接从 `web/` 发布。
- 正式域名唯一使用 `game.onovich.com`。不得把本游戏绑定到其他 Onovich 子域，也不得修改个人站点的部署配置。

## GitHub 与 DNS 设置

1. 仓库 `onovich/King-Varos-Table` 的 Pages 发布源使用 **GitHub Actions**。
2. Pages 的 Custom domain 设置为 `game.onovich.com`。
3. DNS 使用 `CNAME`：`game.onovich.com` 指向 `onovich.github.io`，不附加仓库路径。
4. DNS 检查通过、证书签发后启用 **Enforce HTTPS**。

自定义 GitHub Actions 发布不会使用仓库里的 `CNAME` 文件；域名以 GitHub Pages 设置为准。

## 验收

- Actions 的 `validate` 与 `deploy` 任务均成功。
- `https://game.onovich.com/` 返回游戏页面，而不是个人主页或博客页面。
- `https://game.onovich.com/?mode=puzzle` 能载入可玩棋盘及关卡 JSON。
- 页面资源无 404，浏览器控制台无模块或跨源错误。
- HTTP 自动跳转到 HTTPS。
