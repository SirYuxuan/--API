'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Switch, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface LoginFormProps {
  onLogin: (token: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onSubmit = async (values: any) => {
    setLoading(true)
    try {
      const endpoint = isLogin ? '/api/admin/auth/login' : '/api/admin/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      const result = await response.json()

      if (result.success) {
        onLogin(result.data.token)
        message.success(isLogin ? '登录成功' : '注册成功')
      } else {
        message.error(result.error || '操作失败')
      }
    } catch (error) {
      message.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    form.resetFields()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2} className="mb-2">
            {isLogin ? '登录' : '注册'} 星语管理系统
          </Title>
          <Text type="secondary">
            {isLogin ? '还没有账户？' : '已有账户？'}
            <Button type="link" onClick={switchMode} className="p-0 ml-1">
              {isLogin ? '立即注册' : '立即登录'}
            </Button>
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入邮箱地址"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          {!isLogin && (
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: false }]}
            >
              <Input placeholder="请输入姓名（可选）" />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              {isLogin ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
