# Vercel 部署指南

## 1. 准备工作

### 1.1 安装 Vercel CLI
```bash
npm i -g vercel
```

### 1.2 登录 Vercel
```bash
vercel login
```

## 2. 环境变量配置

在 Vercel 控制台中设置以下环境变量：

### 必需的环境变量：
```
DATABASE_URL=your_postgresql_connection_string
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
JWT_SECRET=your_jwt_secret_key
API_SECRET_KEY=your_api_secret_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE_URL=https://api.openai.com/v1
NODE_ENV=production
```

### 可选的环境变量：
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

## 3. 部署步骤

### 3.1 本地部署测试
```bash
# 构建项目
npm run build

# 本地测试
npm run start
```

### 3.2 部署到 Vercel
```bash
# 在项目根目录执行
vercel

# 或者直接部署到生产环境
vercel --prod
```

### 3.3 配置环境变量
1. 访问 Vercel 控制台
2. 选择你的项目
3. 进入 Settings > Environment Variables
4. 添加上述所有环境变量

## 4. 数据库配置

确保你的 PostgreSQL 数据库允许来自 Vercel 的连接：
- 检查防火墙设置
- 确保连接字符串正确
- 测试数据库连接

## 5. 验证部署

### 5.1 健康检查
```bash
curl https://your-app.vercel.app/api/system/health
```

### 5.2 测试公开API
```bash
# 测试牌阵API
curl https://your-app.vercel.app/api/public/tarot/spreads

# 测试用户登录
curl -X POST https://your-app.vercel.app/api/public/user/login \
  -H "Content-Type: application/json" \
  -d '{"appleId": "test123"}'
```

## 6. 常见问题

### 6.1 数据库连接问题
- 检查 DATABASE_URL 是否正确
- 确保数据库允许外部连接
- 检查网络连接

### 6.2 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查变量名是否正确
- 重新部署以确保环境变量生效

### 6.3 API 路由问题
- 检查文件路径是否正确
- 确保导出了正确的 HTTP 方法
- 查看 Vercel 函数日志

## 7. 监控和维护

### 7.1 查看日志
```bash
vercel logs
```

### 7.2 监控性能
- 使用 Vercel Analytics
- 监控 API 响应时间
- 检查错误率

### 7.3 更新部署
```bash
# 重新部署
vercel --prod

# 或者通过 Git 推送自动部署
git push origin main
```

## 8. 安全注意事项

1. **环境变量安全**：不要在代码中硬编码敏感信息
2. **数据库安全**：使用强密码和安全的连接字符串
3. **API 安全**：实施适当的认证和授权
4. **CORS 配置**：根据需要配置跨域访问

## 9. 性能优化

1. **数据库连接池**：使用连接池减少连接开销
2. **缓存策略**：利用 Redis 缓存提高性能
3. **API 优化**：减少不必要的数据库查询
4. **静态资源**：使用 CDN 加速静态资源加载

## 10. 故障排除

如果遇到问题，请检查：
1. Vercel 函数日志
2. 环境变量配置
3. 数据库连接状态
4. API 响应格式

更多帮助请参考 [Vercel 官方文档](https://vercel.com/docs)。