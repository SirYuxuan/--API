import { NextRequest, NextResponse } from 'next/server'
import { TarotService } from '@/lib/tarot-service'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const createSpreadSchema = z.object({
  name: z.string().min(1, '牌阵名称不能为空').max(255, '牌阵名称不能超过255个字符'),
  cardCount: z.number().int().min(1, '卡牌数量必须大于0').max(100, '卡牌数量不能超过100'),
  aiPrompt: z.string().optional(),
  pointMultiplier: z.number().min(0.1, '点数倍率必须大于0.1').max(10, '点数倍率不能超过10'),
  isEnabled: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const spreads = await TarotService.getAllSpreads()

    return NextResponse.json({
      success: true,
      data: spreads
    })
  } catch (error: any) {
    console.error('Get tarot spreads error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取牌阵列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createSpreadSchema.parse(body)

    const spread = await TarotService.createSpread(validatedData)

    return NextResponse.json({
      success: true,
      data: spread,
      message: '牌阵创建成功'
    })
  } catch (error: any) {
    console.error('Create tarot spread error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: '参数错误',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || '创建牌阵失败' },
      { status: 500 }
    )
  }
}
