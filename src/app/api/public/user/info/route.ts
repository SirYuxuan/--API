import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'
import { z } from 'zod'

const querySchema = z.object({
  uid: z.string().regex(/^\d+$/, 'UID必须是数字')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { uid } = querySchema.parse({
      uid: searchParams.get('uid')
    })

    const user = await UserService.getUserByUid(parseInt(uid))

    if (!user) {
      return NextResponse.json({
        success: false, 
        error: '用户不存在' 
      })
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Get user info error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false, 
        error: '参数错误',
        details: error.errors 
      })
    }

    return NextResponse.json({
      success: false, 
      error: error.message || '获取用户信息失败' 
    })
  }
}
