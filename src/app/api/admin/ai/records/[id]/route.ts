import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { AIAdminService } from '@/lib/ai-admin-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: '无效的记录ID' })
    }

    // 获取AI调用记录详情
    const record = await AIAdminService.getCallRecordById(id)
    if (!record) {
      return NextResponse.json({ success: false, error: '记录不存在' })
    }

    return NextResponse.json({
      success: true,
      data: record
    })
  } catch (error: any) {
    console.error('Get AI call record detail API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取AI调用记录详情失败'
    })
  }
}
