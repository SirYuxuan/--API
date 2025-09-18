#!/usr/bin/env node

/**
 * API测试脚本
 * 用于测试系统的主要API接口
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
let authToken = null

// 测试工具函数
const test = async (name, fn) => {
  try {
    console.log(`🧪 测试: ${name}`)
    await fn()
    console.log(`✅ 通过: ${name}\n`)
  } catch (error) {
    console.log(`❌ 失败: ${name}`)
    console.log(`   错误: ${error.message}\n`)
  }
}

const request = async (url, options = {}) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error || data.message || 'Unknown error'}`)
  }

  return data
}

// 测试用例
const tests = [
  // 健康检查
  async () => {
    const data = await request('/api/health')
    if (data.status !== 'ok') {
      throw new Error('健康检查失败')
    }
  },

  // 用户注册
  async () => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'testpassword123',
      name: '测试用户'
    }

    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    if (!data.success || !data.data.token) {
      throw new Error('用户注册失败')
    }

    authToken = data.data.token
    console.log(`   注册用户: ${userData.email}`)
  },

  // 用户登录
  async () => {
    const loginData = {
      email: 'admin@xingyu.com',
      password: 'admin123'
    }

    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    })

    if (!data.success || !data.data.token) {
      throw new Error('用户登录失败')
    }

    authToken = data.data.token
    console.log(`   登录用户: ${loginData.email}`)
  },

  // 获取当前用户信息
  async () => {
    const data = await request('/api/auth/me')
    if (!data.success || !data.data.user) {
      throw new Error('获取用户信息失败')
    }
    console.log(`   当前用户: ${data.data.user.username}`)
  },

  // 获取用户列表
  async () => {
    const data = await request('/api/users?page=1&limit=5')
    if (!data.success || !Array.isArray(data.data.users)) {
      throw new Error('获取用户列表失败')
    }
    console.log(`   用户数量: ${data.data.users.length}`)
  },

  // 创建文章
  async () => {
    const postData = {
      title: `测试文章 ${Date.now()}`,
      content: '这是一篇测试文章的内容。',
      status: 'DRAFT'
    }

    const data = await request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })

    if (!data.success || !data.data.post) {
      throw new Error('创建文章失败')
    }
    console.log(`   创建文章: ${data.data.post.title}`)
  },

  // 获取文章列表
  async () => {
    const data = await request('/api/posts?page=1&limit=5')
    if (!data.success || !Array.isArray(data.data.posts)) {
      throw new Error('获取文章列表失败')
    }
    console.log(`   文章数量: ${data.data.posts.length}`)
  },

  // 创建API密钥
  async () => {
    const keyData = {
      name: `测试密钥 ${Date.now()}`,
      permissions: {
        read: true,
        write: true
      }
    }

    const data = await request('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData)
    })

    if (!data.success || !data.data.apiKey) {
      throw new Error('创建API密钥失败')
    }
    console.log(`   创建API密钥: ${data.data.apiKey.name}`)
  },

  // 获取API密钥列表
  async () => {
    const data = await request('/api/api-keys')
    if (!data.success || !Array.isArray(data.data.apiKeys)) {
      throw new Error('获取API密钥列表失败')
    }
    console.log(`   API密钥数量: ${data.data.apiKeys.length}`)
  },

  // 获取统计数据
  async () => {
    const data = await request('/api/stats')
    if (!data.success || !data.data.stats) {
      throw new Error('获取统计数据失败')
    }
    console.log(`   用户总数: ${data.data.stats.users.total}`)
    console.log(`   文章总数: ${data.data.stats.posts.total}`)
  },

  // 获取API文档
  async () => {
    const data = await request('/api/docs')
    if (!data.title || !data.endpoints) {
      throw new Error('获取API文档失败')
    }
    console.log(`   API文档: ${data.title}`)
  }
]

// 运行测试
const runTests = async () => {
  console.log('🚀 开始API测试\n')
  console.log(`📍 测试地址: ${BASE_URL}\n`)

  for (const testFn of tests) {
    await test(testFn.name, testFn)
  }

  console.log('🎉 测试完成！')
}

// 检查Node.js版本
if (process.version < 'v18.0.0') {
  console.error('❌ 需要Node.js 18或更高版本')
  process.exit(1)
}

// 运行测试
runTests().catch(console.error)
