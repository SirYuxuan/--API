import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'
import { z } from 'zod'

const loginSchema = z.object({
  appleId: z.string().min(1, 'Apple ID不能为空')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appleId } = loginSchema.parse(body)

    const result = await UserService.login(appleId)

    return NextResponse.json({
      success: true,
      data: result,
      message: result.isNewUser ? '新用户注册成功' : '登录成功'
    })
  } catch (error: any) {
    console.error('User login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false, 
        error: '参数错误',
        details: error.errors 
      })
    }

    return NextResponse.json({
      success: false, 
      error: error.message || '登录失败' 
    })
  }
}
