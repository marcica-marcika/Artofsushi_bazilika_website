# Art of Sushi Bazilika · artofsushibp.hu

临时仓库（原仓库 catvir4493/artofsushi-bazilika 所在账号被封，2026-11-20 迁到这里）。

## 这份代码是怎么来的
旧仓库拉不下来，本地和项目里的副本都停在 11 月 4–6 日，所以网站文件是 **2026-11-20 从线上 artofsushibp.hu 完整下载** 的，内容和线上一模一样（含菜单 PDF、图库、菜单分类图）。

- 这是**构建后的成品**：直接作为静态网站发布即可，不需要构建命令。
- `_headers`（安全头、pages.dev 不收录）和 `_redirects`（/foglalas）是按线上实际行为重新写的，因为 Cloudflare 不会公开这两个文件。
- `apps-script/Code.gs` 是项目里保存的 11 月 12 日版本；**以 Google Apps Script 编辑器里正在运行的那份为准**。
- 旧仓库里的 Pages CMS 后台（`.pages.yml`、`content/*.json`、`scripts/build.mjs` 和 HTML 里的 `data-cms` 标记）还没有恢复，所以现在老板后台改不了这份网站。

## 发布（Cloudflare Pages）
- 构建命令：留空
- 输出目录：`/`（仓库根目录）
- 生产分支：`main`

## 菜单二维码
打印出来的二维码指向 `/menu/etlap-hu.pdf` 和 `/menu/menu-en.pdf`，这两个路径不要改。
