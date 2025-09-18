'use client'

import { useState, useEffect } from 'react'
import type { Dayjs } from 'dayjs'
import {
  Table,
  Card,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Descriptions,
  message,
  Pagination,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  RobotOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface AICallRecord {
  id: number
  userId: number
  uid: number
  conversationId: number
  spreadId: number
  spreadName: string
  question: string
  cards: string
  pointsCost: number
  responseLength: number
  createdAt: string
  userNickname?: string
  userAvatar?: string
}

interface AICallStats {
  totalCalls: number
  totalPointsCost: number
  totalResponseLength: number
  averageResponseLength: number
  callsBySpread: Array<{
    spreadName: string
    count: number
    pointsCost: number
  }>
  callsByDay: Array<{
    date: string
    count: number
    pointsCost: number
  }>
}

export default function AICallRecordsTable() {
  const [records, setRecords] = useState<AICallRecord[]>([])
  const [stats, setStats] = useState<AICallStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [spreadId, setSpreadId] = useState<number | undefined>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<AICallRecord | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [spreads, setSpreads] = useState<Array<{id: number, name: string}>>([])

  useEffect(() => {
    fetchRecords()
    fetchStats()
    fetchSpreads()
  }, [currentPage, pageSize, search, spreadId, dateRange])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(spreadId && { spreadId: spreadId.toString() }),
        ...(dateRange && {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        })
      })

      const response = await fetch(`/api/admin/ai/records?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setRecords(result.data.records)
        setTotal(result.data.total)
      } else {
        message.error(result.error || '获取记录失败')
      }
    } catch (error) {
      console.error('Fetch records error:', error)
      message.error('获取记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/admin/ai/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const fetchSpreads = async () => {
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
      }
    } catch (error) {
      console.error('Fetch spreads error:', error)
    }
  }

  const handleViewDetail = async (record: AICallRecord) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/ai/records/${record.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setSelectedRecord(result.data)
        setDetailModalVisible(true)
      } else {
        message.error(result.error || '获取详情失败')
      }
    } catch (error) {
      console.error('Fetch record detail error:', error)
      message.error('获取详情失败')
    }
  }

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (record: AICallRecord) => (
        <Space>
          <Avatar src={record.userAvatar} icon={<UserOutlined />} />
          <div>
            <div>{record.userNickname || '未知用户'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>UID: {record.uid}</div>
          </div>
        </Space>
      )
    },
    {
      title: '牌阵',
      dataIndex: 'spreadName',
      key: 'spreadName',
      render: (name: string) => <Tag color="blue">{name}</Tag>
    },
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      width: 200
    },
    {
      title: '消耗点数',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      render: (cost: number | string) => (
        <Tag color="red" icon={<DollarOutlined />}>
          {Number(cost).toFixed(2)}
        </Tag>
      )
    },
    {
      title: '响应长度',
      dataIndex: 'responseLength',
      key: 'responseLength',
      render: (length: number) => `${length} 字符`
    },
    {
      title: '调用时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (record: AICallRecord) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      )
    }
  ]

  return (
    <div>
      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总调用次数"
                value={stats.totalCalls}
                prefix={<RobotOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总消耗点数"
                value={Number(stats.totalPointsCost)}
                precision={2}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均响应长度"
                value={Number(stats.averageResponseLength)}
                precision={0}
                suffix="字符"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总响应长度"
                value={Number(stats.totalResponseLength)}
                suffix="字符"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索用户、UID或问题"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select
              placeholder="选择牌阵"
              value={spreadId}
              onChange={setSpreadId}
              allowClear
              style={{ width: 150 }}
            >
              {spreads.map(spread => (
                <Option key={spread.id} value={spread.id}>
                  {spread.name}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              placeholder={['开始日期', '结束日期']}
            />
            <Button type="primary" onClick={fetchRecords}>
              搜索
            </Button>
          </Space>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
        />

        {/* 分页 */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page, size) => {
              setCurrentPage(page)
              setPageSize(size || 20)
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
            }
          />
        </div>
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="AI调用记录详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="用户信息" span={2}>
              <Space>
                <Avatar src={selectedRecord.userAvatar} icon={<UserOutlined />} />
                <div>
                  <div>{selectedRecord.userNickname || '未知用户'}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    UID: {selectedRecord.uid}
                  </div>
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="牌阵">
              <Tag color="blue">{selectedRecord.spreadName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="消耗点数">
              <Tag color="red">{Number(selectedRecord.pointsCost).toFixed(2)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="响应长度">
              {selectedRecord.responseLength} 字符
            </Descriptions.Item>
            <Descriptions.Item label="调用时间">
              {dayjs(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="问题" span={2}>
              {selectedRecord.question}
            </Descriptions.Item>
            <Descriptions.Item label="抽到的牌" span={2}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {selectedRecord.cards}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
