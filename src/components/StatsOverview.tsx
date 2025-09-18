'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, List, Avatar, Tag, Typography, Spin } from 'antd'
import { UserOutlined, CrownOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface Stats {
  users: {
    total: number
    active: number
    recent: Array<{
      id: string
      username: string
      email: string
      createdAt: string
    }>
  }
  tarotSpreads: {
    total: number
    enabled: number
    recent: Array<{
      id: number
      name: string
      cardCount: number
      createdAt: string
    }>
  }
}

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Text type="secondary">无法加载统计数据</Text>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.users.total}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.users.active}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="牌阵总数"
              value={stats.tarotSpreads.total}
              prefix={<CrownOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="启用牌阵"
              value={stats.tarotSpreads.enabled}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近用户" extra={<Text type="secondary">共 {stats.users.recent.length} 个</Text>}>
            <List
              dataSource={stats.users.recent}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={user.username}
                    description={user.email}
                  />
                  <div>
                    <Text type="secondary" className="text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="最近牌阵" extra={<Text type="secondary">共 {stats.tarotSpreads.recent.length} 个</Text>}>
            <List
              dataSource={stats.tarotSpreads.recent}
              renderItem={(spread) => (
                <List.Item>
                  <List.Item.Meta
                    title={spread.name}
                    description={`${spread.cardCount} 张卡牌`}
                  />
                  <div>
                    <Text type="secondary" className="text-xs">
                      {new Date(spread.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
