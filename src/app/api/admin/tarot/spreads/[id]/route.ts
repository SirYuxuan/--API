import { NextRequest, NextResponse } from 'next/server'
import { TarotService } from '@/lib/tarot-service'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const updateSpreadSchema = z.object({
  name: z.string().min(1, '牌阵名称不能为空').max(255, '牌阵名称不能超过255个字符').optional(),
  cardCount: z.number().int().min(1, '卡牌数量必须大于0').max(100, '卡牌数量不能超过100').optional(),
  aiPrompt: z.string().optional(),
  pointMultiplier: z.number().min(0.1, '点数倍率必须大于0.1').max(10, '点数倍率不能超过10').optional(),
  isEnabled: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的ID' },
        { status: 400 }
      )
    }

    const spread = await TarotService.getSpreadById(id)
    if (!spread) {
      return NextResponse.json(
        { success: false, error: '牌阵不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: spread
    })
  } catch (error: any) {
    console.error('Get tarot spread error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取牌阵详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateSpreadSchema.parse(body)

    const spread = await TarotService.updateSpread(id, validatedData)
    if (!spread) {
      return NextResponse.json(
        { success: false, error: '牌阵不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: spread,
      message: '牌阵更新成功'
    })
  } catch (error: any) {
    console.error('Update tarot spread error:', error)
    
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
      { success: false, error: error.message || '更新牌阵失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的ID' },
        { status: 400 }
      )
    }

    const success = await TarotService.deleteSpread(id)
    if (!success) {
      return NextResponse.json(
        { success: false, error: '牌阵不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '牌阵删除成功'
    })
  } catch (error: any) {
    console.error('Delete tarot spread error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '删除牌阵失败' },
      { status: 500 }
    )
  }
}
