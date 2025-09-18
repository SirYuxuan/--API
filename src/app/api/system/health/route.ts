import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import upstashRedis from '@/lib/upstash-redis'

export async function GET() {
  try {
    // 检查数据库连接
    await query('SELECT 1')
    const dbStatus = 'healthy'

    // 检查Redis连接
    let redisStatus = 'healthy'
    try {
      await upstashRedis.get('test')
    } catch (error) {
      redisStatus = 'unhealthy'
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          type: 'PostgreSQL'
        },
        cache: {
          status: redisStatus,
          type: 'Redis'
        }
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    const httpStatus = dbStatus === 'healthy' && redisStatus === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: httpStatus })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        services: {
          database: {
            status: 'unhealthy',
            type: 'PostgreSQL'
          },
          cache: {
            status: 'unknown',
            type: 'Redis'
          }
        }
      },
      { status: 503 }
    )
  }
}
