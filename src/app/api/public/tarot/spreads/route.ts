import { NextResponse } from 'next/server'
import { TarotService } from '@/lib/tarot-service'

export async function GET() {
  try {
    const spreads = await TarotService.getEnabledSpreads()

    return NextResponse.json({
      success: true,
      data: spreads
    })
  } catch (error: any) {
    console.error('Get public tarot spreads error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取牌阵列表失败' },
      { status: 500 }
    )
  }
}
