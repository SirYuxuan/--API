import { query } from './db'

export interface CheckinRecord {
  id: number
  userId: number
  checkinDate: string
  pointsEarned: number
  createdAt: string
}

export interface CheckinResult {
  success: boolean
  pointsEarned: number
  totalPoints: number
  isFirstCheckinToday: boolean
  message: string
}

export class CheckinService {
  /**
   * 用户签到
   */
  static async checkin(userId: number): Promise<CheckinResult> {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
      
      // 检查今日是否已签到
      const existingCheckin = await query(
        'SELECT id FROM user_checkins WHERE user_id = $1 AND checkin_date = $2',
        [userId, today]
      )

      if (existingCheckin.rows.length > 0) {
        return {
          success: false,
          pointsEarned: 0,
          totalPoints: 0,
          isFirstCheckinToday: false,
          message: '今日已签到，请明天再来'
        }
      }

      // 开始事务
      await query('BEGIN')

      try {
        // 插入签到记录
        const checkinResult = await query(
          `INSERT INTO user_checkins (user_id, checkin_date, points_earned, created_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING id, points_earned`,
          [userId, today, 5]
        )

        // 更新用户点数
        const updateUserResult = await query(
          'UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2 RETURNING points',
          [5, userId]
        )

        if (updateUserResult.rows.length === 0) {
          throw new Error('用户不存在')
        }

        await query('COMMIT')

        return {
          success: true,
          pointsEarned: checkinResult.rows[0].points_earned,
          totalPoints: updateUserResult.rows[0].points,
          isFirstCheckinToday: true,
          message: '签到成功，获得5个点数'
        }
      } catch (error) {
        await query('ROLLBACK')
        throw error
      }
    } catch (error) {
      console.error('Checkin error:', error)
      throw new Error('签到失败')
    }
  }

  /**
   * 检查用户今日是否已签到
   */
  static async hasCheckedInToday(userId: number): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const result = await query(
        'SELECT id FROM user_checkins WHERE user_id = $1 AND checkin_date = $2',
        [userId, today]
      )
      return result.rows.length > 0
    } catch (error) {
      console.error('Check checkin status error:', error)
      return false
    }
  }


  /**
   * 获取用户连续签到天数
   */
  static async getConsecutiveCheckinDays(userId: number): Promise<number> {
    try {
      const result = await query(
        `WITH checkin_dates AS (
           SELECT checkin_date,
                  ROW_NUMBER() OVER (ORDER BY checkin_date DESC) as rn,
                  checkin_date - ROW_NUMBER() OVER (ORDER BY checkin_date DESC) as grp
           FROM user_checkins
           WHERE user_id = $1
         ),
         consecutive_groups AS (
           SELECT grp, COUNT(*) as consecutive_days
           FROM checkin_dates
           GROUP BY grp
           ORDER BY MIN(checkin_date) DESC
         )
         SELECT consecutive_days
         FROM consecutive_groups
         LIMIT 1`,
        [userId]
      )

      return result.rows.length > 0 ? result.rows[0].consecutive_days : 0
    } catch (error) {
      console.error('Get consecutive checkin days error:', error)
      return 0
    }
  }
}
