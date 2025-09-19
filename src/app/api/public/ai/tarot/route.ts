import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { query } from '@/lib/db'
import { z } from 'zod'

const tarotRequestSchema = z.object({
  uid: z.number().int().positive('UID必须是正整数'),
  spreadId: z.number().int().positive('牌阵ID必须是正整数'),
  question: z.string().min(1, '问题不能为空').max(500, '问题不能超过500个字符'),
  cards: z.array(z.object({
    name: z.string().min(1, '牌名不能为空'),
    position: z.enum(['upright', 'reversed'], {
      message: '牌位必须是upright或reversed'
    })
  })).min(1, '至少需要一张牌').max(20, '最多20张牌')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, spreadId, question, cards } = tarotRequestSchema.parse(body)

    // 根据UID获取用户ID
    const userResult = await query(
      'SELECT id FROM users WHERE uid = $1',
      [uid]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    const userId = userResult.rows[0].id

    // 生成塔罗牌解读
    const stream = await AIService.generateTarotReading({
      userId,
      spreadId,
      question,
      cards
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('Tarot AI API error:', error)
    
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

    if (error.message === '点数不足') {
      return NextResponse.json(
        { 
          success: false, 
          error: '点数不足，无法进行塔罗牌解读' 
        },
        { status: 402 }
      )
    }

    if (error.message === '牌阵不存在') {
      return NextResponse.json(
        { 
          success: false, 
          error: '牌阵不存在' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '塔罗牌解读失败' 
      },
      { status: 500 }
    )
  }
}
