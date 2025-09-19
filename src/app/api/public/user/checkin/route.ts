import { NextRequest, NextResponse } from 'next/server'
import { CheckinService } from '@/lib/checkin-service'
import { UserService } from '@/lib/user-service'
import { z } from 'zod'

const checkinSchema = z.object({
  uid: z.number().int().positive('UID必须是正整数')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid } = checkinSchema.parse(body)

    // 根据UID获取用户ID
    const user = await UserService.getUserByUid(uid)
    if (!user) {
      return NextResponse.json({
        success: false, 
        error: '用户不存在' 
      })
    }

    // 执行签到
    const checkinResult = await CheckinService.checkin(user.id)

    if (!checkinResult.success) {
      return NextResponse.json({
        success: false, 
        error: checkinResult.message,
        data: {
          pointsEarned: 0,
          totalPoints: user.points,
          hasCheckedInToday: checkinResult.isFirstCheckinToday
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: checkinResult.pointsEarned,
        totalPoints: checkinResult.totalPoints,
        hasCheckedInToday: checkinResult.isFirstCheckinToday
      },
      message: checkinResult.message
    })
  } catch (error: any) {
    console.error('User checkin error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false, 
        error: '参数错误',
        details: error.errors 
      })
    }

    return NextResponse.json({
      success: false, 
      error: error.message || '签到失败' 
    })
  }
}
