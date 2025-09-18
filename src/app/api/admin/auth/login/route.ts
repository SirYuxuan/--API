import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { AuditService } from '@/lib/audit'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6位')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const { user, token } = await AuthService.login(email, password)

    // Log audit
    const clientInfo = AuditService.getClientInfo(request)
    await AuditService.log({
      userId: user.id,
      action: 'LOGIN',
      resource: 'USER',
      details: { email },
      ...clientInfo
    })

    return NextResponse.json({
      success: true,
      data: { user, token }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
