'use client'

import { useState, useEffect } from 'react'
import type { Dayjs } from 'dayjs'
import { 
  Table, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Tag, 
  Avatar, 
  Space, 
  message, 
  DatePicker,
  Row,
  Col,
  Statistic
} from 'antd'
import { SearchOutlined, UserOutlined, CalendarOutlined, GiftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography
const { RangePicker } = DatePicker

interface CheckinRecord {
  id: number
  userId: number
  uid: number
  nickname: string
  appleId: string
  checkinDate: string
  pointsEarned: number
  createdAt: string
}

interface CheckinStats {
  totalCheckins: number
  totalPointsEarned: number
  todayCheckins: number
  uniqueUsers: number
}

interface CheckinRecordsResponse {
  records: CheckinRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function CheckinRecordsTable() {
  const [records, setRecords] = useState<CheckinRecord[]>([])
  const [stats, setStats] = useState<CheckinStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  useEffect(() => {
    fetchRecords()
    fetchStats()
  }, [pagination.current, pagination.pageSize, search, dateRange])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString()
      })

      if (search) {
        params.append('search', search)
      }

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }

      const response = await fetch(`/api/admin/checkins?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取签到记录失败')
      }

      const data: { success: boolean; data: CheckinRecordsResponse } = await response.json()
      if (data.success) {
        setRecords(data.data.records)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total
        }))
      } else {
        message.error('获取签到记录失败')
      }
    } catch (error) {
      console.error('Fetch checkin records error:', error)
      message.error('获取签到记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/checkins/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: { success: boolean; data: CheckinStats } = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      }
    } catch (error) {
      console.error('Fetch checkin stats error:', error)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleReset = () => {
    setSearch('')
    setDateRange(null)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const columns = [
    {
      title: '用户信息',
      key: 'user',
      render: (record: CheckinRecord) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div className="font-medium">{record.nickname}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              UID: {record.uid}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Apple ID',
      dataIndex: 'appleId',
      key: 'appleId',
      render: (appleId: string) => (
        <Text code style={{ fontSize: '12px' }}>{appleId}</Text>
      ),
    },
    {
      title: '签到日期',
      dataIndex: 'checkinDate',
      key: 'checkinDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(date).format('YYYY-MM-DD')}</Text>
        </Space>
      ),
      sorter: (a: CheckinRecord, b: CheckinRecord) => 
        dayjs(a.checkinDate).unix() - dayjs(b.checkinDate).unix(),
    },
    {
      title: '获得积分',
      dataIndex: 'pointsEarned',
      key: 'pointsEarned',
      render: (points: number | string) => (
        <Tag color="green" icon={<GiftOutlined />}>
          +{Number(points).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: '签到时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: CheckinRecord, b: CheckinRecord) => 
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card>
              <Statistic
                title="总签到次数"
                value={stats.totalCheckins}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总获得积分"
                value={Number(stats.totalPointsEarned).toFixed(2)}
                prefix={<GiftOutlined />}
                suffix="分"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日签到"
                value={stats.todayCheckins}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="签到用户数"
                value={stats.uniqueUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div className="mb-4">
          <Space wrap>
            <Input
              placeholder="搜索用户昵称、Apple ID或UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              placeholder={['开始日期', '结束日期']}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={records}
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
      </Card>
    </div>
  )
}
