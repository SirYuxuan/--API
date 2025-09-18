import { query } from './db'
import { TarotService } from './tarot-service'

export interface TarotCard {
  name: string
  position: 'upright' | 'reversed'
}

export interface TarotAIRequest {
  userId: number
  spreadId: number
  question: string
  cards: TarotCard[]
}

export interface AIConversation {
  id: number
  userId: number
  conversationType: string
  status: string
  totalCost: number
  createdAt: Date
  updatedAt: Date
}

export interface AIMessage {
  id: number
  conversationId: number
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: any
  createdAt: Date
}

export class AIService {
  private static readonly OPENAI_API_URL = 'https://api.gptsapi.net/v1'
  private static readonly OPENAI_API_KEY = 'sk-k99045316f2b2db60126da5860b46654da2e1bc45cciBT4s'

  /**
   * 创建AI对话
   */
  static async createConversation(userId: number, conversationType: string): Promise<AIConversation> {
    const result = await query(
      `INSERT INTO ai_conversations (user_id, conversation_type, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, user_id as "userId", conversation_type as "conversationType", 
                 status, total_cost as "totalCost", created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, conversationType]
    )
    return result.rows[0]
  }

  /**
   * 添加消息到对话
   */
  static async addMessage(
    conversationId: number, 
    role: 'user' | 'assistant' | 'system', 
    content: string, 
    metadata?: any
  ): Promise<AIMessage> {
    const result = await query(
      `INSERT INTO ai_messages (conversation_id, role, content, metadata, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, conversation_id as "conversationId", role, content, metadata, created_at as "createdAt"`,
      [conversationId, role, content, metadata ? JSON.stringify(metadata) : null]
    )
    return result.rows[0]
  }

  /**
   * 获取对话历史
   */
  static async getConversationHistory(conversationId: number): Promise<AIMessage[]> {
    const result = await query(
      `SELECT id, conversation_id as "conversationId", role, content, metadata, created_at as "createdAt"
       FROM ai_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    )
    return result.rows
  }

  /**
   * 检查用户点数是否足够
   */
  static async checkUserPoints(userId: number, requiredPoints: number): Promise<boolean> {
    const result = await query(
      'SELECT points FROM users WHERE id = $1',
      [userId]
    )
    if (result.rows.length === 0) return false
    return Number(result.rows[0].points) >= requiredPoints
  }

  /**
   * 扣除用户点数（原子操作）
   */
  static async deductUserPoints(userId: number, points: number): Promise<boolean> {
    try {
      // 使用原子更新操作，确保并发安全
      const result = await query(
        `UPDATE users 
         SET points = points - $1, updated_at = NOW() 
         WHERE id = $2 AND points >= $1
         RETURNING points`,
        [points, userId]
      )
      
      // 如果更新成功且返回了结果，说明点数足够且已扣除
      return result.rows.length > 0
    } catch (error) {
      console.error('Deduct user points error:', error)
      return false
    }
  }

  /**
   * 塔罗牌AI解读
   */
  static async generateTarotReading(request: TarotAIRequest): Promise<ReadableStream> {
    // 获取牌阵信息
    const spread = await TarotService.getSpreadById(request.spreadId)
    if (!spread) {
      throw new Error('牌阵不存在')
    }

    // 计算消耗点数
    const cost = 1 * Number(spread.pointMultiplier)

    // 立即扣除用户点数（使用事务确保原子性）
    const deductSuccess = await this.deductUserPoints(request.userId, cost)
    if (!deductSuccess) {
      throw new Error('点数不足')
    }

    // 创建对话
    const conversation = await this.createConversation(request.userId, 'tarot')

    // 添加用户消息
    await this.addMessage(conversation.id, 'user', request.question, {
      spreadId: request.spreadId,
      cards: request.cards
    })

    // 记录塔罗牌请求
    await query(
      `INSERT INTO tarot_ai_requests (user_id, conversation_id, spread_id, question, cards, cost, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        request.userId,
        conversation.id,
        request.spreadId,
        request.question,
        JSON.stringify(request.cards),
        cost
      ]
    )

    // 构建提示词
    const prompt = this.buildTarotPrompt(spread, request.question, request.cards)

    // 调用OpenAI API
    return this.callOpenAIStream(prompt, conversation.id, cost)
  }

  /**
   * 构建塔罗牌提示词
   */
  private static buildTarotPrompt(spread: any, question: string, cards: TarotCard[]): string {
    let prompt = spread.aiPrompt || '请根据塔罗牌为用户提供解读。\n\n'
    
    prompt += `用户问题：${question}\n\n`
    prompt += `牌阵：${spread.name}（${spread.cardCount}张牌）\n\n`
    prompt += `抽到的牌：\n`
    
    cards.forEach((card, index) => {
      const position = card.position === 'upright' ? '正位' : '逆位'
      prompt += `${index + 1}. ${card.name}（${position}）\n`
    })
    
    prompt += `\n请根据以上信息，为用户提供详细的塔罗牌解读，包括每张牌的含义、整体解读和建议。`
    
    return prompt
  }

  /**
   * 调用OpenAI流式API
   */
  private static async callOpenAIStream(prompt: string, conversationId: number, cost: number): Promise<ReadableStream> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API密钥未配置')
    }

    const response = await fetch(`${this.OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的塔罗牌解读师，请用温和、智慧的语言为用户提供塔罗牌解读。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    // 创建流式响应处理器
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    let fullContent = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // 保存完整回复到数据库
                  await AIService.addMessage(conversationId, 'assistant', fullContent)
                  
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    fullContent += content
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error)
          controller.error(error)
        }
      }
    })

    return stream
  }

  /**
   * 根据ID获取对话
   */
  static async getConversationById(conversationId: number): Promise<AIConversation> {
    const result = await query(
      `SELECT id, user_id as "userId", conversation_type as "conversationType", 
              status, total_cost as "totalCost", created_at as "createdAt", updated_at as "updatedAt"
       FROM ai_conversations WHERE id = $1`,
      [conversationId]
    )
    return result.rows[0]
  }
}
