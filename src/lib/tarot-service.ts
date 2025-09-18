import { query } from './db'

export interface TarotSpread {
  id: number
  name: string
  cardCount: number
  aiPrompt: string | null
  pointMultiplier: number
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TarotSpreadSimple {
  name: string
  cardCount: number
}

export class TarotService {
  /**
   * 获取所有牌阵（管理用，包含完整信息）
   */
  static async getAllSpreads(): Promise<TarotSpread[]> {
    try {
      const result = await query(
        `SELECT id, name, card_count as "cardCount", ai_prompt as "aiPrompt", 
                point_multiplier as "pointMultiplier", is_enabled as "isEnabled", 
                created_at as "createdAt", updated_at as "updatedAt"
         FROM tarot_spreads
         ORDER BY created_at DESC`
      )
      return result.rows
    } catch (error) {
      console.error('Get all tarot spreads error:', error)
      throw new Error('获取牌阵列表失败')
    }
  }

  /**
   * 获取启用的牌阵（API用，返回完整信息）
   */
  static async getEnabledSpreads(): Promise<Pick<TarotSpread, 'id' | 'name' | 'cardCount' | 'pointMultiplier'>[]> {
    try {
      const result = await query(
        `SELECT id, name, card_count as "cardCount", point_multiplier as "pointMultiplier"
         FROM tarot_spreads
         WHERE is_enabled = true
         ORDER BY point_multiplier DESC, created_at ASC`
      )
      return result.rows
    } catch (error) {
      console.error('Get enabled tarot spreads error:', error)
      throw new Error('获取牌阵列表失败')
    }
  }

  /**
   * 根据ID获取牌阵详情
   */
  static async getSpreadById(id: number): Promise<TarotSpread | null> {
    try {
      const result = await query(
        `SELECT id, name, card_count as "cardCount", ai_prompt as "aiPrompt", 
                point_multiplier as "pointMultiplier", is_enabled as "isEnabled", 
                created_at as "createdAt", updated_at as "updatedAt"
         FROM tarot_spreads
         WHERE id = $1`,
        [id]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Get tarot spread by id error:', error)
      throw new Error('获取牌阵详情失败')
    }
  }

  /**
   * 创建新牌阵
   */
  static async createSpread(data: {
    name: string
    cardCount: number
    aiPrompt?: string
    pointMultiplier: number
    isEnabled: boolean
  }): Promise<TarotSpread> {
    try {
      const result = await query(
        `INSERT INTO tarot_spreads (name, card_count, ai_prompt, point_multiplier, is_enabled, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, name, card_count, ai_prompt, point_multiplier, is_enabled, created_at, updated_at`,
        [data.name, data.cardCount, data.aiPrompt || null, data.pointMultiplier, data.isEnabled]
      )
      return result.rows[0]
    } catch (error) {
      console.error('Create tarot spread error:', error)
      throw new Error('创建牌阵失败')
    }
  }

  /**
   * 更新牌阵
   */
  static async updateSpread(id: number, data: {
    name?: string
    cardCount?: number
    aiPrompt?: string
    pointMultiplier?: number
    isEnabled?: boolean
  }): Promise<TarotSpread | null> {
    try {
      const fields = []
      const values = []
      let paramIndex = 0

      if (data.name !== undefined) {
        paramIndex++
        fields.push(`name = $${paramIndex}`)
        values.push(data.name)
      }
      if (data.cardCount !== undefined) {
        paramIndex++
        fields.push(`card_count = $${paramIndex}`)
        values.push(data.cardCount)
      }
      if (data.aiPrompt !== undefined) {
        paramIndex++
        fields.push(`ai_prompt = $${paramIndex}`)
        values.push(data.aiPrompt)
      }
      if (data.pointMultiplier !== undefined) {
        paramIndex++
        fields.push(`point_multiplier = $${paramIndex}`)
        values.push(data.pointMultiplier)
      }
      if (data.isEnabled !== undefined) {
        paramIndex++
        fields.push(`is_enabled = $${paramIndex}`)
        values.push(data.isEnabled)
      }

      if (fields.length === 0) {
        throw new Error('没有要更新的字段')
      }

      paramIndex++
      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await query(
        `UPDATE tarot_spreads 
         SET ${fields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, card_count, ai_prompt, point_multiplier, is_enabled, created_at, updated_at`,
        values
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Update tarot spread error:', error)
      throw new Error('更新牌阵失败')
    }
  }

  /**
   * 删除牌阵
   */
  static async deleteSpread(id: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM tarot_spreads WHERE id = $1',
        [id]
      )
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Delete tarot spread error:', error)
      throw new Error('删除牌阵失败')
    }
  }
}
