import { query } from './db'

export interface AICallRecord {
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

export interface AICallStats {
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

export class AIAdminService {
  static async getCallRecords(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    spreadId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<{ records: AICallRecord[], total: number }> {
    try {
      let whereConditions = ['1=1']
      let params: any[] = []
      let paramIndex = 1

      if (search) {
        whereConditions.push(`(u.nickname ILIKE $${paramIndex} OR u.uid::text ILIKE $${paramIndex} OR tar.question ILIKE $${paramIndex})`)
        params.push(`%${search}%`)
        paramIndex++
      }

      if (spreadId) {
        whereConditions.push(`tar.spread_id = $${paramIndex}`)
        params.push(spreadId)
        paramIndex++
      }

      if (startDate) {
        whereConditions.push(`tar.created_at >= $${paramIndex}`)
        params.push(startDate)
        paramIndex++
      }

      if (endDate) {
        whereConditions.push(`tar.created_at <= $${paramIndex}`)
        params.push(endDate)
        paramIndex++
      }

      const whereClause = whereConditions.join(' AND ')

      // 获取总数
      const countQuery = `
        SELECT COUNT(*)
        FROM tarot_ai_requests tar
        JOIN users u ON tar.user_id = u.id
        WHERE ${whereClause}
      `
      const countResult = await query(countQuery, params)
      const total = parseInt(countResult.rows[0].count)

      // 获取记录
      const offset = (page - 1) * pageSize
      const recordsQuery = `
        SELECT 
          tar.id,
          tar.user_id as "userId",
          u.uid,
          tar.conversation_id as "conversationId",
          tar.spread_id as "spreadId",
          ts.name as "spreadName",
          tar.question,
          tar.cards::text as "cards",
          tar.cost as "pointsCost",
          LENGTH(COALESCE(am.content, '')) as "responseLength",
          tar.created_at as "createdAt",
          u.nickname as "userNickname",
          u.avatar_url as "userAvatar"
        FROM tarot_ai_requests tar
        JOIN users u ON tar.user_id = u.id
        LEFT JOIN tarot_spreads ts ON tar.spread_id = ts.id
        LEFT JOIN ai_messages am ON tar.conversation_id = am.conversation_id AND am.role = 'assistant'
        WHERE ${whereClause}
        ORDER BY tar.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `
      params.push(pageSize, offset)

      const recordsResult = await query(recordsQuery, params)
      const records = recordsResult.rows

      return { records, total }
    } catch (error) {
      console.error('Get AI call records error:', error)
      throw new Error('获取AI调用记录失败')
    }
  }

  static async getCallStats(
    startDate?: string,
    endDate?: string
  ): Promise<AICallStats> {
    try {
      let whereConditions = ['1=1']
      let params: any[] = []
      let paramIndex = 1

      if (startDate) {
        whereConditions.push(`tar.created_at >= $${paramIndex}`)
        params.push(startDate)
        paramIndex++
      }

      if (endDate) {
        whereConditions.push(`tar.created_at <= $${paramIndex}`)
        params.push(endDate)
        paramIndex++
      }

      const whereClause = whereConditions.join(' AND ')

      // 总体统计
      const statsQuery = `
        SELECT 
          COUNT(*) as "totalCalls",
          COALESCE(SUM(tar.cost), 0) as "totalPointsCost",
          COALESCE(SUM(LENGTH(COALESCE(am.content, ''))), 0) as "totalResponseLength",
          COALESCE(AVG(LENGTH(COALESCE(am.content, ''))), 0) as "averageResponseLength"
        FROM tarot_ai_requests tar
        LEFT JOIN ai_messages am ON tar.conversation_id = am.conversation_id AND am.role = 'assistant'
        WHERE ${whereClause}
      `
      const statsResult = await query(statsQuery, params)
      const stats = statsResult.rows[0]

      // 按牌阵统计
      const spreadStatsQuery = `
        SELECT 
          ts.name as "spreadName",
          COUNT(*) as count,
          COALESCE(SUM(tar.cost), 0) as "pointsCost"
        FROM tarot_ai_requests tar
        LEFT JOIN tarot_spreads ts ON tar.spread_id = ts.id
        WHERE ${whereClause}
        GROUP BY ts.name
        ORDER BY count DESC
      `
      const spreadStatsResult = await query(spreadStatsQuery, params)
      const callsBySpread = spreadStatsResult.rows

      // 按日期统计
      const dailyStatsQuery = `
        SELECT 
          DATE(tar.created_at) as date,
          COUNT(*) as count,
          COALESCE(SUM(tar.cost), 0) as "pointsCost"
        FROM tarot_ai_requests tar
        WHERE ${whereClause}
        GROUP BY DATE(tar.created_at)
        ORDER BY date DESC
        LIMIT 30
      `
      const dailyStatsResult = await query(dailyStatsQuery, params)
      const callsByDay = dailyStatsResult.rows

      return {
        totalCalls: parseInt(stats.totalCalls),
        totalPointsCost: parseFloat(stats.totalPointsCost),
        totalResponseLength: parseInt(stats.totalResponseLength),
        averageResponseLength: parseFloat(stats.averageResponseLength),
        callsBySpread,
        callsByDay
      }
    } catch (error) {
      console.error('Get AI call stats error:', error)
      throw new Error('获取AI调用统计失败')
    }
  }

  static async getCallRecordById(id: number): Promise<AICallRecord | null> {
    try {
      const result = await query(`
        SELECT 
          tar.id,
          tar.user_id as "userId",
          u.uid,
          tar.conversation_id as "conversationId",
          tar.spread_id as "spreadId",
          ts.name as "spreadName",
          tar.question,
          tar.cards::text as "cards",
          tar.cost as "pointsCost",
          LENGTH(COALESCE(am.content, '')) as "responseLength",
          tar.created_at as "createdAt",
          u.nickname as "userNickname",
          u.avatar_url as "userAvatar"
        FROM tarot_ai_requests tar
        JOIN users u ON tar.user_id = u.id
        LEFT JOIN tarot_spreads ts ON tar.spread_id = ts.id
        LEFT JOIN ai_messages am ON tar.conversation_id = am.conversation_id AND am.role = 'assistant'
        WHERE tar.id = $1
      `, [id])

      return result.rows[0] || null
    } catch (error) {
      console.error('Get AI call record by id error:', error)
      throw new Error('获取AI调用记录详情失败')
    }
  }
}
