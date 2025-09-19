# API 接口文档

## 用户管理

### 用户登录
- **接口**: `POST /api/public/user/login`
- **参数**: 
  ```json
  {
    "appleId": "string"
  }
  ```
- **返回**:
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

### 获取用户信息
- **接口**: `GET /api/public/user/info?uid=10000010`
- **参数**: uid (查询参数)
- **返回**:
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

### 用户签到
- **接口**: `POST /api/public/user/checkin`
- **参数**:
  ```json
  {
    "uid": 10000013
  }
  ```
- **返回**:
  ```json
  {
    "success": true,
    "data": {
      "pointsEarned": 5,
      "totalPoints": 15,
      "hasCheckedInToday": true
    },
    "message": "签到成功，获得5个点数"
  }
  ```

### 签到统计
- **接口**: `GET /api/public/user/checkin/stats?uid=10000013`
- **参数**: uid (查询参数)
- **返回**:
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

## 塔罗牌服务

### 获取牌阵列表
- **接口**: `GET /api/public/tarot/spreads`
- **参数**: 无
- **返回**:
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
      }
    ]
  }
  ```

### AI塔罗牌解读
- **接口**: `POST /api/public/ai/tarot`
- **参数**:
  ```json
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
- **返回**: 流式数据 (Server-Sent Events)
  ```
  data: {"content":"愚"}
  data: {"content":"者"}
  data: {"content":"代"}
  ...
  data: [DONE]
  ```

### 对话历史
- **接口**: `GET /api/public/ai/conversations?uid=10000013&conversationId=123`
- **参数**: uid, conversationId (查询参数)
- **返回**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "role": "user",
        "content": "我的工作前景如何？",
        "createdAt": "2025-09-18T03:34:38.009Z"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "愚者代表新的开始...",
        "createdAt": "2025-09-18T03:34:40.123Z"
      }
    ]
  }
  ```

## 系统接口

### 健康检查
- **接口**: `GET /api/system/health`
- **参数**: 无
- **返回**:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-18T03:34:38.009Z",
    "version": "1.0.0",
    "environment": "production"
  }
  ```