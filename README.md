# Art of Sushi Bazilika · artofsushibp.hu

临时仓库（原仓库 catvir4493/artofsushi-bazilika 所在账号被封，2026-11-20 迁到这里）。

## 这份代码是怎么来的
旧仓库拉不下来，本地和项目里的副本都停在 11 月 4–6 日，所以网站文件是 **2026-11-20 从线上 artofsushibp.hu 完整下载** 的，内容和线上一模一样（含菜单 PDF、图库、菜单分类图）。

- `apps-script/Code.gs` 是项目里保存的版本；**以 Google Apps Script 编辑器里正在运行的那份为准**。

## 老板后台（Pages CMS）· 2026-11-23 恢复
- 后台地址 https://app.pagescms.org ，配置在 `.pages.yml`，内容在 `content/*.json`（营业信息、价格、公告、菜单分类、主厨推荐、画廊、介绍文字）。
- `bazilika.html` 和 `index.html` 是**带 `data-cms` 标记的源文件**；`scripts/build.mjs` 把 content 写进去，输出到 `dist/`（不进仓库）。
- 本地预览：`node scripts/build.mjs`，然后打开 `dist/` 里的网页。
- 构建会检查：时间格式、价格数字、公告日期、照片是否存在。出错时部署停止，线上继续显示上一版。
- 改网页结构时，保留 `data-cms*` 标记；新增日文字要加进 `scripts/jp-chars.txt` 并重新做字体子集。

## 发布（Cloudflare Worker `artofsushibp`）
- 推送到生产分支后自动部署：`npx wrangler deploy` 会先运行 `wrangler.jsonc` 里的 `build.command`（`node scripts/build.mjs`），再上传 `dist/`。
- 生产分支：`claude/project-thread-qswdtt`（仓库默认分支）。Pages CMS 保存也是提交到这个分支。

## 菜单二维码
打印出来的二维码指向 `/menu/etlap-hu.pdf` 和 `/menu/menu-en.pdf`，这两个路径不要改。
