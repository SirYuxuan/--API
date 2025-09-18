import { query } from './db'
import { CheckinService } from './checkin-service'

export interface User {
  id: number
  uid: number
  appleId: string
  nickname: string
  avatarUrl: string | null
  points: number
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface LoginResponse {
  uid: number
  nickname: string
  avatarUrl: string | null
  points: number
  isNewUser: boolean
  hasCheckedInToday: boolean
}

export class UserService {
  /**
   * 用户登录/注册
   * 如果Apple ID不存在则创建新用户，存在则更新登录时间
   */
  static async login(appleId: string): Promise<LoginResponse> {
    try {
      const defaultNickname = '星语用户'
      const defaultAvatarUrl = 'https://oss.yuxuan66.com/image/tou.png'
      
      // 先查询用户是否存在
      const existingUserResult = await query(
        'SELECT uid, nickname, avatar_url, points FROM users WHERE apple_id = $1',
        [appleId]
      )

              if (existingUserResult.rows.length > 0) {
                // 用户存在，更新登录时间
                await query(
                  'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE apple_id = $1',
                  [appleId]
                )

                const user = existingUserResult.rows[0]
                
                // 检查今日是否已签到
                const hasCheckedInToday = await CheckinService.hasCheckedInToday(user.id)
                
                return {
                  uid: user.uid,
                  nickname: user.nickname,
                  avatarUrl: user.avatar_url,
                  points: user.points,
                  isNewUser: false,
                  hasCheckedInToday
                }
              } else {
                // 用户不存在，创建新用户
                const newUserResult = await query(
                  `INSERT INTO users (uid, apple_id, nickname, avatar_url, points, last_login_at, created_at, updated_at)
                   VALUES (nextval('user_uid_seq'), $1, $2, $3, 0, NOW(), NOW(), NOW())
                   RETURNING id, uid, nickname, avatar_url, points`,
                  [appleId, defaultNickname, defaultAvatarUrl]
                )

                const user = newUserResult.rows[0]
                
                // 新用户今日未签到
                return {
                  uid: user.uid,
                  nickname: user.nickname,
                  avatarUrl: user.avatar_url,
                  points: user.points,
                  isNewUser: true,
                  hasCheckedInToday: false
                }
              }
    } catch (error) {
      console.error('User login error:', error)
      throw new Error('用户登录失败')
    }
  }

  /**
   * 获取用户列表（后台管理用）
   */
  static async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ users: User[]; total: number; pages: number }> {
    try {
      const offset = (page - 1) * limit
      
      let whereClause = 'WHERE 1=1'
      const params: any[] = []
      let paramCount = 0

      if (search) {
        paramCount++
        whereClause += ` AND (nickname ILIKE $${paramCount} OR apple_id ILIKE $${paramCount})`
        params.push(`%${search}%`)
      }

      const [usersResult, totalResult] = await Promise.all([
        query(
          `SELECT id, uid, apple_id, nickname, avatar_url, points, last_login_at, created_at, updated_at
           FROM users ${whereClause}
           ORDER BY created_at DESC
           LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
          [...params, limit, offset]
        ),
        query(
          `SELECT COUNT(*) as count FROM users ${whereClause}`,
          params
        )
      ])

      const users = usersResult.rows.map(row => ({
        id: row.id,
        uid: row.uid,
        appleId: row.apple_id,
        nickname: row.nickname,
        avatarUrl: row.avatar_url,
        points: row.points,
        lastLoginAt: row.last_login_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      const total = parseInt(totalResult.rows[0].count)
      const pages = Math.ceil(total / limit)

      return { users, total, pages }
    } catch (error) {
      console.error('Get users error:', error)
      throw new Error('获取用户列表失败')
    }
  }

  /**
   * 根据UID获取用户信息
   */
  static async getUserByUid(uid: number): Promise<User | null> {
    try {
      const result = await query(
        'SELECT id, uid, apple_id, nickname, avatar_url, points, last_login_at, created_at, updated_at FROM users WHERE uid = $1',
        [uid]
      )

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        id: row.id,
        uid: row.uid,
        appleId: row.apple_id,
        nickname: row.nickname,
        avatarUrl: row.avatar_url,
        points: row.points,
        lastLoginAt: row.last_login_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    } catch (error) {
      console.error('Get user by UID error:', error)
      throw new Error('获取用户信息失败')
    }
  }

  /**
   * 更新用户点数
   */
  static async updatePoints(uid: number, points: number): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET points = $1, updated_at = NOW() WHERE uid = $2',
        [points, uid]
      )
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Update points error:', error)
      throw new Error('更新用户点数失败')
    }
  }

  /**
   * 更新用户头像
   */
  static async updateAvatar(uid: number, avatarUrl: string): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE uid = $2',
        [avatarUrl, uid]
      )
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Update avatar error:', error)
      throw new Error('更新用户头像失败')
    }
  }
}
