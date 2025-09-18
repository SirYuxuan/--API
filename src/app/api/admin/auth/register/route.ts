import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { AuditService } from '@/lib/audit'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, name } = registerSchema.parse(body)

    const { user, token } = await AuthService.register(email, username, password, name)

    // Log audit
    const clientInfo = AuditService.getClientInfo(request)
    await AuditService.log({
      userId: user.id,
      action: 'REGISTER',
      resource: 'USER',
      details: { email, username },
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
