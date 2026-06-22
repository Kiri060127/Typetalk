# TypeTalk

这是一款基于 MBTI 性格类型的社交平台，帮助用户发现性格相投的朋友，探索不同人格类型的奇妙世界。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | [Next.js 14](https://nextjs.org/) | React 全栈框架，App Router 模式 |
| 语言 | [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) | 原子化 CSS 框架 |
| UI 组件 | [Radix UI](https://www.radix-ui.com/) | 无样式可访问性组件 |
| 图标 | [Lucide React](https://lucide.dev/) | 现代图标库 |
| 数据库 | [SQLite](https://sqlite.org/) + [Prisma](https://www.prisma.io/) | ORM 与关系型数据库 |
| 会话 | [iron-session](https://github.com/vvo/iron-session) | 加密 cookie 会话管理 |
| 实时通信 | [Socket.IO](https://socket.io/) | WebSocket 实时消息与语音通话 |
| WebRTC | [simple-peer](https://github.com/feross/simple-peer) | 点对点音视频通话 |

## 项目架构

```
TypeTalk/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── public/
│   └── uploads/               # 用户上传文件（头像、动态图片）
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API 路由（RESTful 接口）
│   │   │   ├── auth/          # 认证相关（登录、资料）
│   │   │   ├── ai/            # AI 功能（破冰话题）
│   │   │   ├── conversations/ # 会话管理
│   │   │   ├── friends/       # 好友关系
│   │   │   ├── messages/      # 消息系统
│   │   │   ├── notifications/ # 通知系统
│   │   │   ├── posts/         # 动态广场
│   │   │   ├── search/        # 搜索功能
│   │   │   ├── upload/        # 文件上传
│   │   │   └── users/         # 用户管理
│   │   ├── chat/              # 聊天页面
│   │   ├── discover/          # 发现朋友页面
│   │   ├── friends/           # 好友列表页面
│   │   ├── me/                # 个人中心
│   │   ├── mbti-test/         # MBTI 测试
│   │   ├── notifications/     # 通知中心
│   │   ├── search/            # 搜索页面
│   │   ├── square/            # 动态广场
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # 可复用组件
│   │   ├── BottomNav.tsx      # 底部导航
│   │   ├── TopBar.tsx         # 顶部栏
│   │   ├── UserCard.tsx       # 用户卡片
│   │   ├── FriendButton.tsx   # 好友按钮
│   │   ├── NotificationBell.tsx # 通知铃铛
│   │   ├── ThemeToggle.tsx    # 主题切换
│   │   ├── ThemeProvider.tsx  # 主题提供者
│   │   ├── ImageUploader.tsx  # 图片上传
│   │   ├── CallModal.tsx      # 通话弹窗
│   │   └── MbtiTagBar.tsx     # MBTI 标签栏
│   ├── hooks/                 # 自定义 Hooks
│   │   └── useWebRTC.ts       # WebRTC 通话逻辑
│   ├── lib/                   # 工具库
│   │   ├── auth.ts            # 认证工具
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── socket.ts          # Socket.IO 客户端
│   │   ├── notifications.ts   # 通知工具
│   │   ├── mbti-data.ts       # MBTI 类型数据
│   │   └── mbti.ts            # MBTI 工具函数
│   └── types/                 # TypeScript 类型
│       └── index.ts           # 全局类型定义
├── .env.local                 # 环境变量
├── next.config.js             # Next.js 配置
├── tailwind.config.ts         # Tailwind 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 项目依赖
```

## 核心功能

### 1. 用户系统
- 基于 iron-session 的加密 cookie 认证
- 支持昵称、MBTI 类型、个性签名、头像编辑
- 图片上传与存储

### 2. MBTI 测试
- 12 道测试题覆盖 4 个维度（EI/SN/TF/JP）
- 自动计算 16 型人格结果
- 结果保存到用户资料

### 3. 社交功能
- **发现朋友**: 浏览所有用户，按 MBTI 类型筛选
- **好友系统**: 发送/接受/拒绝好友请求
- **动态广场**: 发布图文动态，点赞评论
- **搜索**: 支持用户和动态内容搜索

### 4. 消息系统
- 实时一对一聊天（Socket.IO）
- 消息已读状态与已读时间
- 语音通话（WebRTC + Socket.IO 信令）

### 5. 通知系统
- 新消息、点赞、评论、好友请求通知
- 顶部铃铛下拉列表
- 通知中心页面（支持筛选和批量操作）

### 6. 主题切换
- 深色/浅色模式切换
- localStorage 持久化
- CSS 变量驱动

## 数据库模型

| 模型 | 说明 |
|------|------|
| User | 用户（基本信息、MBTI、头像） |
| Interest | 兴趣标签 |
| Conversation | 聊天会话 |
| Message | 消息（支持已读状态） |
| Post | 动态帖子 |
| Like | 点赞 |
| Comment | 评论 |
| Notification | 通知 |
| Friend | 好友关系（pending/accepted/rejected） |

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-secret-key-here"
```

### 初始化数据库

```bash
npx prisma db push
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产模式

```bash
npm run build
npm start
```

## 项目特色

- **深色主题设计**: 采用深邃靛蓝配色，支持明暗切换
- **玻璃拟态卡片**: 半透明背景与柔和阴影
- **流畅动画**: 页面过渡、悬停效果、加载动画
- **响应式布局**: 适配移动端与桌面端
- **性能优化**: 图片懒加载、组件动态导入、数据库索引

## 许可证

MIT
