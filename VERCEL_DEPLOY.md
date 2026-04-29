# Vercel 部署说明

这个项目包含静态页面和 Node.js API。GitHub Pages 只能部署静态页面，不能运行 `api/` 里的 Node.js 接口，所以请使用下面的方式：

- 代码托管：GitHub
- 公网部署：Vercel
- API 运行方式：Vercel Serverless Functions，路径来自 `api/`

## 已包含的内容

- 静态页面：`index.html`、`leave-detail.html`
- 静态资源：`styles.css`、`main.js`、`leave-detail.js`、`assets/`
- Node.js API：
  - `/api/health`
  - `/api/student-contacts`
  - `/api/students/search`
  - `/api/students/nfc-search`

## 必填环境变量

在 Vercel 项目的 `Settings -> Environment Variables` 中添加：

```env
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_JXT_NAME=jxt_dev
DB_UCENTER_NAME=ucenter_dev
DB_CHARSET=utf8mb4
DB_CONNECTION_LIMIT=3
```

## 部署步骤

1. 将代码推送到 GitHub 仓库。
2. 打开 Vercel，选择 `Add New -> Project`。
3. 导入 GitHub 仓库 `yukiandcece/kindergarten-leave-system`。
4. Framework Preset 选择 `Other`，Root Directory 保持仓库根目录。
5. 添加上面的环境变量。
6. 点击 `Deploy`。
7. 部署完成后访问：
   - 首页：`https://你的项目域名.vercel.app/`
   - 离园详情页：`https://你的项目域名.vercel.app/leave-detail.html`
   - API 健康检查：`https://你的项目域名.vercel.app/api/health`

## 注意事项

- 不要使用 GitHub Pages 部署这个项目，因为 API 会不可用。
- MySQL 数据库需要允许 Vercel 的公网请求访问。
- 数据库账号密码不要硬编码到源码里，线上只通过 Vercel 环境变量读取。
