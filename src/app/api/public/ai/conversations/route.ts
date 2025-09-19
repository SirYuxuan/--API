import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { query } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  uid: z.string().transform(Number).refine(val => !isNaN(val) && val > 0, {
    message: 'UID必须是有效的数字'
  }),
  conversationId: z.string().optional().transform(val => val ? Number(val) : undefined)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { uid, conversationId } = querySchema.parse({
      uid: searchParams.get('uid'),
      conversationId: searchParams.get('conversationId')
    })

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

    if (conversationId) {
      // 获取特定对话的历史
      const messages = await AIService.getConversationHistory(conversationId)
      return NextResponse.json({
        success: true,
        data: { messages }
      })
    } else {
      // 获取用户的所有对话
      const result = await query(
        `SELECT id, conversation_type as "conversationType", status, 
                total_cost as "totalCost", created_at as "createdAt", updated_at as "updatedAt"
         FROM ai_conversations 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [userId]
      )

      return NextResponse.json({
        success: true,
        data: { conversations: result.rows }
      })
    }
  } catch (error: any) {
    console.error('Get conversations API error:', error)
    
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
      { success: false, error: error.message || '获取对话历史失败' },
      { status: 500 }
    )
  }
}
