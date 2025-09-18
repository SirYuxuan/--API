import { query } from './db'

export interface CheckinRecord {
  id: number
  userId: number
  uid: number
  nickname: string
  appleId: string
  checkinDate: string
  pointsEarned: number
  createdAt: string
}

export interface CheckinStats {
  totalCheckins: number
  totalPointsEarned: number
  todayCheckins: number
  uniqueUsers: number
}

export class CheckinAdminService {
  /**
   * 获取签到记录列表（管理员）
   */
  static async getCheckinRecords(params: {
    page?: number
    limit?: number
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    records: CheckinRecord[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const { page = 1, limit = 20, search, startDate, endDate } = params
    const offset = (page - 1) * limit

    let whereConditions = []
    let queryParams: any[] = []
    let paramIndex = 1

    // 搜索条件
    if (search) {
      whereConditions.push(`(u.nickname ILIKE $${paramIndex} OR u.apple_id ILIKE $${paramIndex} OR u.uid::text ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // 日期范围条件
    if (startDate) {
      whereConditions.push(`uc.checkin_date >= $${paramIndex}`)
      queryParams.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`uc.checkin_date <= $${paramIndex}`)
      queryParams.push(endDate)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 获取总数
    const countQuery = `
      SELECT COUNT(*)
      FROM user_checkins uc
      JOIN users u ON uc.user_id = u.id
      ${whereClause}
    `
    const countResult = await query(countQuery, queryParams)
    const total = parseInt(countResult.rows[0].count)

    // 获取记录
    const recordsQuery = `
      SELECT 
        uc.id,
        uc.user_id as "userId",
        u.uid,
        u.nickname,
        u.apple_id as "appleId",
        uc.checkin_date as "checkinDate",
        uc.points_earned as "pointsEarned",
        uc.created_at as "createdAt"
      FROM user_checkins uc
      JOIN users u ON uc.user_id = u.id
      ${whereClause}
      ORDER BY uc.checkin_date DESC, uc.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const recordsParams = [...queryParams, limit, offset]
    const recordsResult = await query(recordsQuery, recordsParams)

    return {
      records: recordsResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 获取签到统计信息
   */
  static async getCheckinStats(): Promise<CheckinStats> {
    const queries = [
      // 总签到次数
      'SELECT COUNT(*) as total_checkins FROM user_checkins',
      // 总获得积分
      'SELECT COALESCE(SUM(points_earned), 0) as total_points FROM user_checkins',
      // 今日签到次数
      `SELECT COUNT(*) as today_checkins FROM user_checkins WHERE checkin_date = CURRENT_DATE`,
      // 签到过的用户数
      'SELECT COUNT(DISTINCT user_id) as unique_users FROM user_checkins'
    ]

    const results = await Promise.all(queries.map(q => query(q)))
    
    return {
      totalCheckins: parseInt(results[0].rows[0].total_checkins),
      totalPointsEarned: parseInt(results[1].rows[0].total_points),
      todayCheckins: parseInt(results[2].rows[0].today_checkins),
      uniqueUsers: parseInt(results[3].rows[0].unique_users)
    }
  }

  /**
   * 获取用户签到记录
   */
  static async getUserCheckinRecords(uid: number, limit: number = 10): Promise<CheckinRecord[]> {
    const result = await query(`
      SELECT 
        uc.id,
        uc.user_id as "userId",
        u.uid,
        u.nickname,
        u.apple_id as "appleId",
        uc.checkin_date as "checkinDate",
        uc.points_earned as "pointsEarned",
        uc.created_at as "createdAt"
      FROM user_checkins uc
      JOIN users u ON uc.user_id = u.id
      WHERE u.uid = $1
      ORDER BY uc.checkin_date DESC, uc.created_at DESC
      LIMIT $2
    `, [uid, limit])

    return result.rows
  }
}
