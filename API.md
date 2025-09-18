# 星语 API 文档

## 概述

星语API是一个基于Next.js 14构建的后端服务，为移动APP提供用户管理和塔罗牌牌阵服务。API使用PostgreSQL作为数据库，Redis作为缓存。

## 基础信息

- **Base URL**: `https://your-domain.vercel.app` (生产环境) / `http://localhost:3000` (开发环境)
- **Content-Type**: `application/json`
- **认证方式**: 无需认证（公开接口）

## API 接口

### 用户管理 API

#### 用户登录/注册
```http
POST /api/public/user/login
Content-Type: application/json

{
  "appleId": "001146.5924d270fe8a40658c93d127b9cfa710.0908"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "uid": 10000010,
    "nickname": "星语用户",
    "avatarUrl": "https://oss.yuxuan66.com/image/tou.png",
    "points": 0,
    "isNewUser": false,
    "hasCheckedInToday": false
  },
  "message": "登录成功"
}
```

**字段说明：**
- `appleId`: Apple ID，用于用户唯一标识
- `uid`: 用户唯一ID，从10000000开始
- `nickname`: 用户昵称，默认为"星语用户"
- `avatarUrl`: 头像地址，默认为"https://oss.yuxuan66.com/image/tou.png"
- `points`: 用户剩余点数
- `isNewUser`: 是否为新用户
- `hasCheckedInToday`: 今日是否已签到

#### 获取用户信息
```http
GET /api/public/user/info?uid=10000010
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "uid": 10000010,
    "appleId": "001146.5924d270fe8a40658c93d127b9cfa710.0908",
    "nickname": "星语用户",
    "avatarUrl": "https://oss.yuxuan66.com/image/tou.png",
    "points": 0,
    "lastLoginAt": "2025-09-18T03:34:38.009Z",
    "createdAt": "2025-09-18T03:34:38.009Z",
    "updatedAt": "2025-09-18T03:34:38.009Z"
  }
}
```

### 塔罗牌牌阵 API

#### 获取牌阵列表
```http
GET /api/public/tarot/spreads
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "凯尔特十字",
      "cardCount": 10,
      "pointMultiplier": "2.00"
    },
    {
      "id": 4,
      "name": "爱情牌阵",
      "cardCount": 5,
      "pointMultiplier": "1.80"
    },
    {
      "id": 2,
      "name": "三张牌阵",
      "cardCount": 3,
      "pointMultiplier": "1.50"
    }
  ]
}
```

**字段说明：**
- `id`: 牌阵唯一ID
- `name`: 牌阵名称
- `cardCount`: 卡牌数量
- `pointMultiplier`: 点数倍率（用于计算AI解读消耗的点数）

#### AI塔罗牌解读
```http
POST /api/public/ai/tarot
Content-Type: application/json

{
  "uid": 10000013,
  "spreadId": 1,
  "question": "我的工作前景如何？",
  "cards": [
    {
      "name": "愚者",
      "position": "upright"
    }
  ]
}
```

**响应格式：**
```
data: {"content":"愚"}

data: {"content":"者"}

data: {"content":"代"}

data: {"content":"表"}

data: {"content":"的"}

...

data: [DONE]
```

**字段说明：**
- `uid`: 用户唯一ID
- `spreadId`: 牌阵ID（从牌阵列表API获取）
- `question`: 用户问题
- `cards`: 抽到的牌数组
  - `name`: 牌的名称
  - `position`: 牌的位置（"upright"正位 或 "reversed"逆位）

**注意事项：**
- 此接口返回流式数据（Server-Sent Events格式）
- 每次调用会消耗点数，消耗量 = 1 × 牌阵倍率
- 用户点数不足时会返回错误

### 用户签到 API

#### 用户签到
```http
POST /api/public/user/checkin
Content-Type: application/json

{
  "uid": 10000013
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "pointsEarned": 5,
    "totalPoints": 10,
    "hasCheckedInToday": true
  },
  "message": "签到成功，获得5个点数"
}
```

**重复签到响应：**
```json
{
  "success": false,
  "error": "今日已签到，请明天再来",
  "data": {
    "hasCheckedInToday": false
  }
}
```

**字段说明：**
- `uid`: 用户唯一ID
- `pointsEarned`: 本次签到获得的点数（固定5点）
- `totalPoints`: 用户总点数
- `hasCheckedInToday`: 今日是否已签到

#### 获取签到统计
```http
GET /api/public/user/checkin/stats?uid=10000013
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "hasCheckedInToday": true,
    "consecutiveDays": 3,
    "totalPoints": 15
  }
}
```

**字段说明：**
- `hasCheckedInToday`: 今日是否已签到
- `consecutiveDays`: 连续签到天数
- `totalPoints`: 用户总点数

## 系统状态 API

### 健康检查
```http
GET /api/system/health
```

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2025-09-18T05:32:44.144Z",
  "services": {
    "database": {
      "status": "healthy",
      "type": "PostgreSQL"
    },
    "cache": {
      "status": "healthy",
      "type": "Redis"
    }
  },
  "version": "1.0.0",
  "environment": "development"
}
```

## 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述",
  "details": "详细错误信息（可选）"
}
```

### HTTP状态码
- `200`: 所有请求都返回200状态码，通过响应中的`success`字段判断请求是否成功

### 常见错误示例

**参数验证错误：**
```json
{
  "success": false,
  "error": "参数错误",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "inclusive": true,
      "exact": false,
      "message": "卡牌数量必须大于0",
      "path": ["cardCount"]
    }
  ]
}
```

**未授权访问：**
```json
{
  "success": false,
  "error": "未授权访问"
}
```

**资源不存在：**
```json
{
  "success": false,
  "error": "用户不存在"
}
```

## 使用示例

### 用户登录和签到流程
```javascript
// 1. 用户登录/注册
const loginResponse = await fetch('/api/public/user/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appleId: 'user_apple_id_here'
  })
});

const loginData = await loginResponse.json();
console.log('用户信息:', loginData.data);

// 2. 检查今日签到状态
if (!loginData.data.hasCheckedInToday) {
  // 执行签到
  const checkinResponse = await fetch('/api/public/user/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uid: loginData.data.uid
    })
  });
  
  const checkinData = await checkinResponse.json();
  if (checkinData.success) {
    console.log('签到成功:', checkinData.message);
    console.log('获得点数:', checkinData.data.pointsEarned);
    console.log('总点数:', checkinData.data.totalPoints);
  } else {
    console.log('签到失败:', checkinData.error);
  }
} else {
  console.log('今日已签到');
}

// 3. 获取签到统计
const statsResponse = await fetch(`/api/public/user/checkin/stats?uid=${loginData.data.uid}`);
const statsData = await statsResponse.json();
console.log('签到统计:', statsData.data);

// 4. 获取可用牌阵列表
const spreadsResponse = await fetch('/api/public/tarot/spreads');
const spreadsData = await spreadsResponse.json();
console.log('可用牌阵:', spreadsData.data);
```

### 错误处理示例
```javascript
try {
  const response = await fetch('/api/public/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      appleId: 'invalid_apple_id'
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    console.error('登录失败:', data.error);
    // 处理错误逻辑
  } else {
    console.log('登录成功:', data.data);
  }
} catch (error) {
  console.error('网络错误:', error);
}
```

## 部署信息

- **平台**: Vercel
- **数据库**: PostgreSQL (Supabase)
- **缓存**: Redis (Upstash)
- **环境变量**:
  - `DATABASE_URL`: PostgreSQL连接字符串
  - `UPSTASH_REDIS_REST_URL`: Redis REST API URL
  - `UPSTASH_REDIS_REST_TOKEN`: Redis REST API Token

## 更新日志

### v1.0.0 (2025-09-18)
- 初始版本发布
- 用户登录/注册功能
- 塔罗牌牌阵查询功能
- PostgreSQL + Redis 架构

---

如有问题或建议，请联系开发团队。
