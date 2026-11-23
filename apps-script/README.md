# 订桌后台：Google 表格 + Apps Script

网站的订桌表单把数据发到这里的 Apps Script，脚本写进 Google 表格，并发两封邮件：一封通知店里（回复地址是客人邮箱），一封自动回执给客人。表格里的「Foglalás」菜单可以给选中的那一行发确认或拒绝邮件。

## 一次性设置（约 15 分钟）

所有步骤都用**店里的 Google 账号** `artofsushi.szentistvan@gmail.com` 做。客人收到的邮件会从这个地址发出。

> 免费 Gmail 每天只能发约 100 封邮件。现在的做法（2026-11-23 起）：
> - 设置了 Brevo（下面「省邮件额度」）后，所有邮件先走 Brevo（免费每天 300 封），Brevo 出问题才用 Gmail。
> - 没有 Brevo 时：不再给店里发「新订单」通知邮件，客人回执只在 Gmail 还剩 15 封以上时发，留给确认邮件。
> - 额度用完时确认/拒绝：状态照样改，「Levél」格子显示 ⏳，额度恢复后每 10 分钟自动补发。菜单「📊 Levélkeret · 邮件额度」随时看剩余。

1. 在 Google Drive 新建一个表格，命名为 `Foglalások – Bazilika`。
2. 菜单 **扩展程序 → Apps Script**，打开脚本编辑器。
3. 删掉默认的 `Code.gs` 内容，把本文件夹里的 `Code.gs` 全部粘贴进去。
4. 左侧齿轮 **项目设置**：
   - 勾选「在编辑器中显示 appsscript.json」，把本文件夹的 `appsscript.json` 内容粘贴进去（时区 Europe/Budapest）。
   - 在「脚本属性」里添加：
     - `NOTIFY_EMAIL` = 接收订桌通知的邮箱，`artofsushi.szentistvan@gmail.com`
     - `TURNSTILE_SECRET` = Cloudflare Turnstile 的 Secret key（可以等 Cloudflare 开好再加）
5. 回到表格，刷新页面，顶部出现「Foglalás」菜单。点 **Foglalás → Első beállítás**，按提示授权。会自动：
   - 建好表头、状态下拉、颜色
   - 新建「Ma」（今天）和「Holnap」（明天）两个视图页
   - 设置每天 4:00 自动删除用餐日期超过 90 天的记录（GDPR）
6. 脚本编辑器右上角 **部署 → 新建部署 → 类型：Web 应用**
   - 执行身份：**我**
   - 有权访问的用户：**任何人**
   - 部署后复制「Web 应用 URL」（以 `/exec` 结尾）。
7. 把这个 URL 填进网站 `js/main.js` 顶部的 `CONFIG.FORM_ENDPOINT`，提交并推送。
8. 在网站上用自己的邮箱提交一次测试订桌，检查：表格多一行、店里收到通知、自己收到回执；再用菜单发一次确认邮件。

> 以后修改 `Code.gs` 后，要在 **部署 → 管理部署 → 编辑 → 版本：新版本** 重新部署，URL 不变。

## 日常使用

- 新订桌：状态「Új」，橙色。
- 选中那一行任意格子 → **Foglalás → ✓ Visszaigazolás küldése**：给客人发确认邮件，状态变「Visszaigazolva」。
- **✕ Elutasítás küldése**：发「没有空桌」的邮件，状态变「Elutasítva」。
- 用餐后可以手动把状态改成「Megjelent」（已到店）或「Nem jelent meg」（未到店）。
- 店里通知邮件里直接点「回复」就是回给客人。
- 客人在英文页面下单，所有邮件自动用英文。

## 字段

| 列 | 说明 |
|---|---|
| Beérkezett | 提交时间 |
| Dátum / Időpont / Létszám | 用餐日期、时间、人数 |
| Név / Telefon / Email | 客人信息 |
| Egyéb kérés | 客人备注 |
| Nyelv | HU / EN，决定邮件语言 |
| Állapot | Új · Visszaigazolva · Elutasítva · Megjelent · Nem jelent meg |
| Kezelte | 谁发的确认 |
| Belső megjegyzés | 店内备注，客人看不到 |
| Azonosító | 订单编号 |

## 防垃圾

- 表单里有一个隐藏字段，机器人填了就直接丢弃。
- 设置了 `TURNSTILE_SECRET` 后，每个提交都必须通过 Cloudflare Turnstile 验证；同时要在 `js/main.js` 填 `CONFIG.TURNSTILE_SITEKEY`。两个要一起填，只填一个会导致订桌失败。

## 周五周六晚上时段

周五、周六 17:00 以后只能选 **17:00–19:00** 和 **19:00–21:00** 两个时段，白天和其他日子还是每半小时一个。表格里只写开始时间（17:00 / 19:00），客人邮件里写完整时段「17:00–19:00」。改时段在 `Code.gs` 顶部 `CFG.SLOTS`，网站在 `js/main.js` 的 `SLOTS`，两边要一起改。

## 省邮件额度：设置 Brevo（免费，每天 300 封）

1. 去 brevo.com 用店里的邮箱注册免费账号。
2. 右上角账号菜单 → **Senders, Domains & Dedicated IPs → Domains → Add a domain**，填 `artofsushibp.hu`。按提示把它给的几条 DNS 记录（brevo-code TXT、DKIM、DMARC）加到 Cloudflare → artofsushibp.hu → DNS，回 Brevo 点验证。
3. **Senders → Add a sender**：名字 `Art of Sushi Bazilika`，邮箱 `foglalas@artofsushibp.hu`。
4. **SMTP & API → API Keys → Generate a new API key**，复制。
5. Apps Script → 项目设置 → 脚本属性，添加：`BREVO_API_KEY` = 刚复制的 key，`BREVO_SENDER` = `foglalas@artofsushibp.hu`。
6. 在表格菜单点 **📊 Levélkeret**，能看到「Brevo: 300/300」就成功了。

客人回信仍然到店里的 Gmail（Reply-To），「Levél 客人邮件」列照常工作。Brevo 发出的邮件不会出现在 Gmail「已发送」里，要查记录去 Brevo → Transactional → Logs。

可选脚本属性 `NOTIFY_MAIL`：`on` = 总是给店里发新订单通知邮件，`off` = 从不发，不填 = 只有设置了 Brevo 才发。
