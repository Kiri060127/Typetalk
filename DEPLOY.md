# Vercel 部署指南

## 部署前准备

### 1. 注册 Vercel 账号
访问 [vercel.com](https://vercel.com)，用 GitHub 账号登录。

### 2. 代码推送到 GitHub

```bash
# 在项目目录初始化 git
cd TypeTalk
git init
git add .
git commit -m "Initial commit"

# 在 GitHub 创建新仓库，然后推送
git remote add origin https://github.com/你的用户名/typetalk.git
git push -u origin main
```

## 部署步骤

### 第一步：导入项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库 "typetalk"
4. 点击 "Import"

### 第二步：配置环境变量

在部署配置页面，添加以下环境变量：

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | Vercel Postgres 或外部数据库 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 存储令牌 | Vercel Dashboard -> Storage |
| `SESSION_SECRET` | 会话加密密钥 | 随机生成 32 位字符串 |

#### 获取 DATABASE_URL（推荐 Vercel Postgres）

1. Vercel Dashboard -> Storage -> Create Database -> Postgres
2. 选择区域（建议选 `Hong Kong` 或 `Singapore`，离国内近）
3. 创建后点击 "Connect"，选择你的项目
4. 自动注入 `DATABASE_URL` 环境变量

#### 获取 BLOB_READ_WRITE_TOKEN

1. Vercel Dashboard -> Storage -> Create Store -> Blob
2. 创建后点击 "Connect"，选择你的项目
3. 自动注入 `BLOB_READ_WRITE_TOKEN` 环境变量

#### 生成 SESSION_SECRET

```bash
# 在终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 第三步：部署

点击 "Deploy"，等待构建完成（约 2-3 分钟）。

部署成功后，你会获得一个域名：`https://typetalk-xxx.vercel.app`

## 数据库迁移

首次部署后，需要创建数据库表：

### 方式一：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd TypeTalk

# 连接项目
vercel link

# 执行数据库迁移
vercel env pull .env.local
npx prisma migrate deploy
```

### 方式二：本地迁移后推送

```bash
# 本地连接远程数据库
DATABASE_URL="你的远程数据库URL" npx prisma migrate dev --name init
```

## 后续更新

每次代码更新推送到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "更新内容"
git push
```

## 自定义域名（可选）

1. Vercel Dashboard -> 你的项目 -> Settings -> Domains
2. 添加你的域名（如 `typetalk.yourdomain.com`）
3. 按提示配置 DNS 解析

## 费用说明

| 服务 | 免费额度 | 超出后 |
|------|---------|--------|
| Vercel 托管 | 100GB 流量/月 | $0.15/GB |
| Vercel Postgres | 256MB 存储 | 按量计费 |
| Vercel Blob | 250MB 存储 | $0.15/GB |

对于小型项目，免费额度完全够用。

## 数据存储位置总结

| 数据类型 | 存储位置 | 是否占本地空间 |
|---------|---------|--------------|
| 用户数据、消息、动态 | Vercel Postgres（云端） | 否 |
| 图片、头像 | Vercel Blob（云端 CDN） | 否 |
| 代码 | GitHub + Vercel | 否 |

**结论**：部署到 Vercel 后，所有数据都在云端，不占用你的本地空间。
