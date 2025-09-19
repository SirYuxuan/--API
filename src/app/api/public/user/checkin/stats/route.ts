import { NextRequest, NextResponse } from 'next/server'
import { CheckinService } from '@/lib/checkin-service'
import { UserService } from '@/lib/user-service'
import { z } from 'zod'

const querySchema = z.object({
  uid: z.string().transform(Number).refine(val => !isNaN(val) && val > 0, {
    message: 'UID必须是有效的数字'
  })
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { uid } = querySchema.parse({
      uid: searchParams.get('uid')
    })

    // 根据UID获取用户ID
    const user = await UserService.getUserByUid(uid)
    if (!user) {
      return NextResponse.json({
        success: false, 
        error: '用户不存在' 
      })
    }

    // 获取签到统计
    const [hasCheckedInToday, consecutiveDays] = await Promise.all([
      CheckinService.hasCheckedInToday(user.id),
      CheckinService.getConsecutiveCheckinDays(user.id)
    ])

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedInToday,
        consecutiveDays,
        totalPoints: user.points
      }
    })
  } catch (error: any) {
    console.error('Get checkin stats error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false, 
        error: '参数错误',
        details: error.errors 
      })
    }

    return NextResponse.json({
      success: false, 
      error: error.message || '获取签到统计失败' 
    })
  }
}
