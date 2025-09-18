'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  Typography
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'

const { TextArea } = Input
const { Text } = Typography

interface TarotSpread {
  id: number
  name: string
  cardCount: number
  aiPrompt: string | null
  pointMultiplier: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export default function TarotSpreadsTable() {
  const [spreads, setSpreads] = useState<TarotSpread[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingSpread, setEditingSpread] = useState<TarotSpread | null>(null)
  const [form] = Form.useForm()

  const fetchSpreads = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/tarot/spreads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setSpreads(result.data)
      } else {
        message.error(result.error || '获取牌阵列表失败')
      }
    } catch (error) {
      console.error('Fetch spreads error:', error)
      message.error('获取牌阵列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/tarot/spreads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })
      const result = await response.json()
      
      if (result.success) {
        message.success('牌阵创建成功')
        setShowCreateForm(false)
        form.resetFields()
        fetchSpreads()
      } else {
        message.error(result.error || '创建牌阵失败')
      }
    } catch (error) {
      console.error('Create spread error:', error)
      message.error('创建牌阵失败')
    }
  }

  const handleEdit = (spread: TarotSpread) => {
    setEditingSpread(spread)
    form.setFieldsValue({
      name: spread.name,
      cardCount: spread.cardCount,
      aiPrompt: spread.aiPrompt,
      pointMultiplier: spread.pointMultiplier,
      isEnabled: spread.isEnabled
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (values: any) => {
    if (!editingSpread) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/tarot/spreads/${editingSpread.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })
      const result = await response.json()
      
      if (result.success) {
        message.success('牌阵更新成功')
        setShowEditForm(false)
        setEditingSpread(null)
        form.resetFields()
        fetchSpreads()
      } else {
        message.error(result.error || '更新牌阵失败')
      }
    } catch (error) {
      console.error('Update spread error:', error)
      message.error('更新牌阵失败')
    }
  }

  const handleToggleStatus = async (record: TarotSpread) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/tarot/spreads/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isEnabled: !record.isEnabled
        })
      })
      const result = await response.json()
      
      if (result.success) {
        message.success(`牌阵已${!record.isEnabled ? '启用' : '禁用'}`)
        fetchSpreads()
      } else {
        message.error(result.error || '状态更新失败')
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      message.error('状态更新失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/tarot/spreads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      
      if (result.success) {
        message.success('牌阵删除成功')
        fetchSpreads()
      } else {
        message.error(result.error || '删除牌阵失败')
      }
    } catch (error) {
      console.error('Delete spread error:', error)
      message.error('删除牌阵失败')
    }
  }

  useEffect(() => {
    fetchSpreads()
  }, [])

  const columns = [
    {
      title: '牌阵名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: '卡牌数量',
      dataIndex: 'cardCount',
      key: 'cardCount',
      render: (count: number) => <Tag color="blue">{count} 张</Tag>
    },
    {
      title: '点数倍率',
      dataIndex: 'pointMultiplier',
      key: 'pointMultiplier',
      render: (multiplier: number) => <Tag color="green">{multiplier}x</Tag>
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: TarotSpread) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: 'AI提示词',
      dataIndex: 'aiPrompt',
      key: 'aiPrompt',
      render: (prompt: string | null) => (
        <Text type="secondary" ellipsis={{ tooltip: prompt }}>
          {prompt || '无'}
        </Text>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (record: TarotSpread) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个牌阵吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div></div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setShowCreateForm(true)}
        >
          创建牌阵
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={spreads}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* 创建牌阵模态框 */}
      <Modal
        title="创建牌阵"
        open={showCreateForm}
        onCancel={() => {
          setShowCreateForm(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="牌阵名称"
            rules={[
              { required: true, message: '请输入牌阵名称' },
              { max: 255, message: '牌阵名称不能超过255个字符' }
            ]}
          >
            <Input placeholder="请输入牌阵名称" />
          </Form.Item>

          <Form.Item
            name="cardCount"
            label="卡牌数量"
            rules={[
              { required: true, message: '请输入卡牌数量' },
              { type: 'number', min: 1, max: 100, message: '卡牌数量必须在1-100之间' }
            ]}
          >
            <InputNumber
              placeholder="请输入卡牌数量"
              min={1}
              max={100}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="pointMultiplier"
            label="点数倍率"
            rules={[
              { required: true, message: '请输入点数倍率' },
              { type: 'number', min: 0.1, max: 10, message: '点数倍率必须在0.1-10之间' }
            ]}
          >
            <InputNumber
              placeholder="请输入点数倍率"
              min={0.1}
              max={10}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="aiPrompt"
            label="AI提示词"
          >
            <TextArea
              placeholder="请输入AI提示词（可选）"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="isEnabled"
            label="是否启用"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => {
                setShowCreateForm(false)
                form.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑牌阵模态框 */}
      <Modal
        title="编辑牌阵"
        open={showEditForm}
        onCancel={() => {
          setShowEditForm(false)
          setEditingSpread(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="name"
            label="牌阵名称"
            rules={[
              { required: true, message: '请输入牌阵名称' },
              { max: 255, message: '牌阵名称不能超过255个字符' }
            ]}
          >
            <Input placeholder="请输入牌阵名称" />
          </Form.Item>

          <Form.Item
            name="cardCount"
            label="卡牌数量"
            rules={[
              { required: true, message: '请输入卡牌数量' },
              { type: 'number', min: 1, max: 100, message: '卡牌数量必须在1-100之间' }
            ]}
          >
            <InputNumber
              placeholder="请输入卡牌数量"
              min={1}
              max={100}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="pointMultiplier"
            label="点数倍率"
            rules={[
              { required: true, message: '请输入点数倍率' },
              { type: 'number', min: 0.1, max: 10, message: '点数倍率必须在0.1-10之间' }
            ]}
          >
            <InputNumber
              placeholder="请输入点数倍率"
              min={0.1}
              max={10}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="aiPrompt"
            label="AI提示词"
          >
            <TextArea
              placeholder="请输入AI提示词（可选）"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="isEnabled"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button onClick={() => {
                setShowEditForm(false)
                setEditingSpread(null)
                form.resetFields()
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
