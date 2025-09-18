'use client'

import { useState, useEffect } from 'react'
import { Table, Input, Select, Button, Card, Typography, Tag, Avatar, Space, message, Modal, Descriptions } from 'antd'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

interface User {
  id: number
  uid: number
  appleId: string
  nickname: string
  avatarUrl: string | null
  points: number
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.current, pagination.pageSize, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result: { success: boolean; data: UsersResponse } = await response.json()
        setUsers(result.data.users)
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination.total
        }))
      } else {
        message.error('获取用户列表失败')
      }
    } catch (error) {
      message.error('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleViewDetail = (user: User) => {
    setSelectedUser(user)
    setDetailModalVisible(true)
  }

  const handleCloseDetail = () => {
    setDetailModalVisible(false)
    setSelectedUser(null)
  }

  const columns = [
    {
      title: '用户信息',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} size="large" />
          <div>
            <div className="font-medium">{record.nickname}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      render: (uid: number) => (
        <Text code>{uid}</Text>
      ),
    },
    {
      title: 'Apple ID',
      dataIndex: 'appleId',
      key: 'appleId',
      render: (appleId: string) => (
        <Text code>{appleId}</Text>
      ),
    },
    {
      title: '剩余点数',
      dataIndex: 'points',
      key: 'points',
      render: (points: number | string) => (
        <Tag color="blue">
          {Number(points).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string | null) => (
        <Text type="secondary">
          {date ? new Date(date).toLocaleString() : '从未登录'}
        </Text>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <Card>
      <div className="mb-4">
        <Space wrap>
          <Input
            placeholder="搜索用户昵称或Apple ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            setPagination(prev => ({
              ...prev,
              current: page,
              pageSize: pageSize || prev.pageSize
            }))
          }
        }}
      />

      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用户ID">
              <Text code>{selectedUser.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="UID">
              <Text code>{selectedUser.uid}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Apple ID">
              <Text code>{selectedUser.appleId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="用户昵称">
              {selectedUser.nickname}
            </Descriptions.Item>
            <Descriptions.Item label="头像">
              <Avatar src={selectedUser.avatarUrl} icon={<UserOutlined />} size="large" />
            </Descriptions.Item>
            <Descriptions.Item label="剩余点数">
              <Tag color="blue">{Number(selectedUser.points).toFixed(2)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最后登录时间">
              {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : '从未登录'}
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {new Date(selectedUser.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(selectedUser.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
