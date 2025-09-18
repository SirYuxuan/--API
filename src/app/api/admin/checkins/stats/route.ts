import { NextRequest, NextResponse } from 'next/server'
import { CheckinAdminService } from '@/lib/checkin-admin-service'
import { AuthService } from '@/lib/auth'

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

    const user = await AuthService.validateToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    // Check authorization
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }

    const stats = await CheckinAdminService.getCheckinStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('Get checkin stats API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取签到统计失败' },
      { status: 500 }
    )
  }
}
