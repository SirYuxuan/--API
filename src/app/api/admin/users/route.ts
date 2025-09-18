import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'
import { AuthService, UserRole } from '@/lib/auth'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional().nullable()
})

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

    const { searchParams } = new URL(request.url)
    const { page, limit, search } = querySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search')
    })

    const result = await UserService.getUsers(parseInt(page), parseInt(limit), search || undefined)

    return NextResponse.json({
      success: true,
      data: {
        users: result.users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          pages: result.pages
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
