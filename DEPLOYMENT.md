# 星语管理系统部署指南

## 数据库设置

### 1. 在Supabase中创建数据库表

1. 登录 [Supabase](https://supabase.com)
2. 进入您的项目
3. 点击左侧菜单的 "SQL Editor"
4. 复制以下SQL文件中的内容并执行：
   - `tarot-spreads.sql` - 创建塔罗牌牌阵表
   - `ai-conversation.sql` - 创建AI对话相关表
5. 塔罗牌牌阵表已经包含了示例数据，无需额外执行种子数据脚本

### 2. 验证数据库设置

执行以下查询验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'posts', 'api_keys', 'audit_logs', 'system_configs');

-- 检查用户数据
SELECT id, email, username, role FROM users;

-- 检查文章数据
SELECT id, title, status FROM posts;
```

## 环境变量配置

### 本地开发环境

创建 `.env.local` 文件：

```env
# Database
DATABASE_URL="postgresql://postgres.mhyqdtpyaqgmpuaunnmu:Yuxuanll2012!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://evident-hornet-40003.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AZxDAAIncDFmMmIwMzZjMTFhYjc0NzFlOWZkMDBhYWQ3NGRhZGMxZHAxNDAwMDM"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="xingyu-admin-secret-key-2024"

# JWT
JWT_SECRET="xingyu-jwt-secret-key-2024"

# API Keys
API_SECRET_KEY="xingyu-api-secret-key-2024"

# Environment
NODE_ENV="development"
```

### Vercel部署环境

在Vercel项目设置中添加以下环境变量：

- `DATABASE_URL`: 您的PostgreSQL连接字符串
- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST Token
- `NEXTAUTH_URL`: 您的域名 (例如: https://your-domain.vercel.app)
- `NEXTAUTH_SECRET`: 随机生成的密钥
- `JWT_SECRET`: 随机生成的JWT密钥
- `API_SECRET_KEY`: 随机生成的API密钥

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

- 前端界面: http://localhost:3000
- API文档: http://localhost:3000/api/docs
- 健康检查: http://localhost:3000/api/health

## Vercel部署

### 1. 安装Vercel CLI

```bash
npm i -g vercel
```

### 2. 部署到Vercel

```bash
vercel --prod
```

### 3. 配置环境变量

在Vercel控制台中设置所有必需的环境变量。

## 默认账户

系统预置了以下测试账户：

- **管理员**: admin@xingyu.com / admin123
- **版主**: moderator@xingyu.com / moderator123
- **用户**: user@xingyu.com / user123

## API测试

运行API测试脚本：

```bash
node scripts/test-api.js
```

## 故障排除

### 数据库连接问题

1. 检查数据库连接字符串是否正确
2. 确认Supabase项目是否正常运行
3. 检查网络连接和防火墙设置

### Redis连接问题

1. 检查Upstash Redis服务是否正常
2. 验证REST URL和Token是否正确
3. 检查网络连接

### 权限问题

1. 确认用户角色设置正确
2. 检查JWT token是否有效
3. 验证API密钥权限设置

## 监控和维护

### 健康检查

定期访问 `/api/health` 端点检查系统状态。

### 日志监控

查看Vercel函数日志和数据库日志来监控系统运行状态。

### 数据备份

定期备份Supabase数据库数据。
