import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { AuthService, UserRole } from '@/lib/auth'
import { cache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未认证' },
        { status: 401 }
      )
    }

    const currentUser = await AuthService.validateToken(token)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    // Check permissions
    if (!AuthService.hasPermission(currentUser.role, UserRole.MODERATOR)) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }

    const cacheKey = 'stats:dashboard'
    
    const stats = await cache.cache(cacheKey, async () => {
      const [
        totalUsersResult,
        activeUsersResult,
        totalTarotSpreadsResult,
        enabledTarotSpreadsResult,
        recentUsersResult,
        recentTarotSpreadsResult
      ] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users'),
        query('SELECT COUNT(*) as count FROM users WHERE last_login_at IS NOT NULL'),
        query('SELECT COUNT(*) as count FROM tarot_spreads'),
        query('SELECT COUNT(*) as count FROM tarot_spreads WHERE is_enabled = true'),
        query(`
          SELECT id, nickname as username, apple_id as email, created_at as "createdAt"
          FROM users
          ORDER BY created_at DESC
          LIMIT 5
        `),
        query(`
          SELECT id, name, card_count, created_at
          FROM tarot_spreads
          ORDER BY created_at DESC
          LIMIT 5
        `)
      ])

      return {
        users: {
          total: parseInt(totalUsersResult.rows[0].count),
          active: parseInt(activeUsersResult.rows[0].count),
          recent: recentUsersResult.rows
        },
        tarotSpreads: {
          total: parseInt(totalTarotSpreadsResult.rows[0].count),
          enabled: parseInt(enabledTarotSpreadsResult.rows[0].count),
          recent: recentTarotSpreadsResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            cardCount: row.card_count,
            createdAt: row.created_at
          }))
        }
      }
    }, 300) // Cache for 5 minutes

    return NextResponse.json({
      success: true,
      data: { stats }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
