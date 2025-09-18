# 星语 API

一个基于 Next.js 14 构建的塔罗牌应用后端API，提供用户管理、塔罗牌牌阵管理和AI解读功能。

## 🚀 功能特性

### 用户管理
- 用户登录/注册（基于Apple ID）
- 用户签到系统（每日签到获得点数）
- 用户信息管理
- 点数系统

### 塔罗牌服务
- 牌阵管理（CRUD操作）
- 公开牌阵查询API
- AI塔罗牌解读（流式响应）
- 点数消耗机制

### 后台管理
- 用户管理界面
- 签到记录管理
- AI调用记录统计
- 牌阵管理
- 数据统计面板

### 技术栈
- **框架**: Next.js 14
- **数据库**: PostgreSQL
- **缓存**: Redis (Upstash)
- **AI**: OpenAI GPT-3.5-turbo
- **UI**: Ant Design
- **部署**: Vercel

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── public/          # 公开API（APP调用）
│   │   ├── admin/           # 管理后台API
│   │   └── system/          # 系统API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/              # React组件
├── lib/                     # 服务类和工具
└── ...
```

## 🔧 环境配置

复制 `env.example` 为 `.env.local` 并配置以下环境变量：

```bash
# 数据库
DATABASE_URL=your_postgresql_url

# Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# JWT
JWT_SECRET=your_jwt_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE_URL=https://api.openai.com/v1

# 其他
API_SECRET_KEY=your_api_secret
NODE_ENV=development
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp env.example .env.local
# 编辑 .env.local 文件
```

### 3. 运行开发服务器
```bash
npm run dev
```

### 4. 构建生产版本
```bash
npm run build
npm start
```

## 📚 API文档

详细的API文档请参考 [API.md](./API.md)

### 主要API端点

#### 公开API（APP调用）
- `POST /api/public/user/login` - 用户登录
- `GET /api/public/user/info` - 获取用户信息
- `POST /api/public/user/checkin` - 用户签到
- `GET /api/public/user/checkin/stats` - 签到统计
- `GET /api/public/tarot/spreads` - 获取牌阵列表
- `POST /api/public/ai/tarot` - AI塔罗牌解读

#### 管理API
- `GET /api/admin/users` - 用户列表
- `GET /api/admin/checkins` - 签到记录
- `GET /api/admin/ai/records` - AI调用记录
- `GET /api/admin/tarot/spreads` - 牌阵管理

## 🚀 部署到Vercel

详细的部署指南请参考 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### 快速部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

## 🔒 安全配置

- 所有敏感信息通过环境变量配置
- 数据库连接字符串已从代码中移除
- API密钥和JWT密钥需要单独配置
- 所有API使用统一的错误处理和状态码

## 📝 开发说明

### 数据库迁移
项目包含必要的SQL文件用于数据库初始化，请根据 `DEPLOYMENT.md` 中的说明执行。

### 代码规范
- 使用TypeScript进行类型检查
- 遵循Next.js 14 App Router规范
- 使用Ant Design组件库
- 统一的错误处理和响应格式

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [项目Issues页面](https://github.com/SirYuxuan/--API/issues)
- 邮箱: [你的邮箱]

---

⭐ 如果这个项目对你有帮助，请给它一个星标！