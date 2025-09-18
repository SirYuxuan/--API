# 星语管理系统

一个基于 Next.js 的全栈后台管理系统，支持用户管理、内容管理、API密钥管理等功能。

## 功能特性

- 🔐 用户认证和权限管理
- 👥 用户管理（增删改查）
- 📝 内容管理（文章管理）
- 🔑 API密钥管理
- 📊 数据统计和仪表盘
- 🚀 支持Vercel部署
- 🗄️ PostgreSQL数据库
- ⚡ Redis缓存
- 🎨 现代化UI界面

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT + NextAuth
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd 星语-API
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制 `env.example` 文件为 `.env.local` 并配置环境变量：

```bash
cp env.example .env.local
```

配置以下环境变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/xingyu_db?schema=public"

# Redis连接
REDIS_URL="redis://localhost:6379"

# NextAuth配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT密钥
JWT_SECRET="your-jwt-secret-here"

# API密钥
API_SECRET_KEY="your-api-secret-key-here"
```

### 4. 数据库设置

```bash
# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 可选：填充示例数据
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到Vercel

### 1. 准备数据库

在Vercel上设置PostgreSQL数据库：
- 使用Vercel Postgres或外部PostgreSQL服务
- 获取数据库连接字符串

### 2. 准备Redis

设置Redis服务：
- 使用Upstash Redis或外部Redis服务
- 获取Redis连接字符串

### 3. 配置环境变量

在Vercel项目设置中添加以下环境变量：

- `DATABASE_URL`: PostgreSQL连接字符串
- `REDIS_URL`: Redis连接字符串
- `NEXTAUTH_URL`: 你的域名
- `NEXTAUTH_SECRET`: 随机生成的密钥
- `JWT_SECRET`: 随机生成的JWT密钥
- `API_SECRET_KEY`: 随机生成的API密钥

### 4. 部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

## API文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "name": "用户姓名"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 用户管理

#### 获取用户列表
```http
GET /api/users?page=1&limit=20&search=keyword&role=USER
Authorization: Bearer <token>
```

### 内容管理

#### 获取文章列表
```http
GET /api/posts?page=1&limit=20&search=keyword&status=PUBLISHED
Authorization: Bearer <token>
```

#### 创建文章
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章内容",
  "status": "DRAFT"
}
```

### API密钥管理

#### 获取API密钥列表
```http
GET /api/api-keys
Authorization: Bearer <token>
```

#### 创建API密钥
```http
POST /api/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "密钥名称",
  "permissions": {
    "read": true,
    "write": false,
    "delete": false,
    "admin": false
  }
}
```

#### 撤销API密钥
```http
POST /api/api-keys/{id}/revoke
Authorization: Bearer <token>
```

### 统计数据

#### 获取仪表盘数据
```http
GET /api/stats
Authorization: Bearer <token>
```

## 权限系统

系统支持三种用户角色：

- **USER**: 普通用户，可以创建和管理自己的内容
- **MODERATOR**: 版主，可以管理用户和内容
- **ADMIN**: 管理员，拥有所有权限

## 开发指南

### 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API路由
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── components/         # React组件
├── lib/               # 工具库
│   ├── auth.ts        # 认证服务
│   ├── cache.ts       # 缓存服务
│   ├── db.ts          # 数据库连接
│   └── redis.ts       # Redis连接
└── types/             # TypeScript类型定义
```

### 添加新功能

1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npm run db:generate` 生成Prisma客户端
3. 在 `src/app/api/` 中创建API路由
4. 在 `src/components/` 中创建前端组件
5. 更新数据库：`npm run db:push`

## 许可证

MIT License
