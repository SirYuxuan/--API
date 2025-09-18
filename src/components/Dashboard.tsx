'use client'

import { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd'
import { 
  DashboardOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CrownOutlined
} from '@ant-design/icons'
import StatsOverview from './StatsOverview'
import UsersTable from './UsersTable'
import TarotSpreadsTable from './TarotSpreadsTable'
import CheckinRecordsTable from './CheckinRecordsTable'
import AICallRecordsTable from './AICallRecordsTable'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface User {
  id: string
  email: string
  username: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'checkins',
      icon: <CrownOutlined />,
      label: '签到记录',
    },
    {
      key: 'ai-calls',
      icon: <CrownOutlined />,
      label: 'AI调用记录',
    },
    {
      key: 'tarot',
      icon: <CrownOutlined />,
      label: '塔罗牌管理',
      children: [
        {
          key: 'tarot-spreads',
          label: '牌阵管理',
        },
      ],
    },
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsOverview />
      case 'users':
        return <UsersTable />
        case 'checkins':
          return <CheckinRecordsTable />
        case 'ai-calls':
          return <AICallRecordsTable />
        case 'tarot-spreads':
          return <TarotSpreadsTable />
        default:
          return <StatsOverview />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理员'
      case 'MODERATOR': return '版主'
      case 'USER': return '用户'
      default: return role
    }
  }

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        className="shadow-lg"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Text strong className="text-lg text-blue-600">
            {collapsed ? '星语' : '星语管理系统'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
    onClick={({ key }) => {
      setActiveTab(key)
    }}
          className="border-r-0"
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          
          <Space>
            <Text type="secondary">
              欢迎回来，{user?.name || user?.username}
            </Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text>{getRoleText(user?.role || '')}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content className="p-6 bg-gray-50">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}
