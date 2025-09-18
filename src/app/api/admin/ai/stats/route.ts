import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/lib/auth'
import { AIAdminService } from '@/lib/ai-admin-service'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '未提供认证令牌' })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.validateToken(token)
    if (!user) {
      return NextResponse.json({ success: false, error: '无效的认证令牌' })
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { startDate, endDate } = querySchema.parse(queryParams)

    // 获取AI调用统计
    const stats = await AIAdminService.getCallStats(startDate, endDate)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('Get AI call stats API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取AI调用统计失败'
    })
  }
}
