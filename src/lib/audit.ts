import { query } from './db'

export interface AuditLogData {
  userId: string
  action: string
  resource: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

export class AuditService {
  static async log(data: AuditLogData) {
    try {
      await query(`
        INSERT INTO audit_logs (id, "userId", action, resource, details, "ipAddress", "userAgent", "createdAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW())
      `, [
        data.userId,
        data.action,
        data.resource,
        JSON.stringify(data.details || {}),
        data.ipAddress,
        data.userAgent
      ])
    } catch (error) {
      console.error('Audit log error:', error)
      // Don't throw error to avoid breaking the main flow
    }
  }

  static async getLogs(
    userId?: string,
    action?: string,
    resource?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramCount = 0

    if (userId) {
      paramCount++
      whereClause += ` AND al."userId" = $${paramCount}`
      params.push(userId)
    }

    if (action) {
      paramCount++
      whereClause += ` AND al.action = $${paramCount}`
      params.push(action)
    }

    if (resource) {
      paramCount++
      whereClause += ` AND al.resource = $${paramCount}`
      params.push(resource)
    }

    const [logsResult, totalResult] = await Promise.all([
      query(`
        SELECT al.*, u.id as user_id, u.username, u.email, u.name
        FROM audit_logs al
        LEFT JOIN users u ON al."userId" = u.id
        ${whereClause}
        ORDER BY al."createdAt" DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `, [...params, limit, skip]),
      query(`
        SELECT COUNT(*) as count FROM audit_logs al ${whereClause}
      `, params)
    ])

    const logs = logsResult.rows.map(row => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      resource: row.resource,
      details: row.details,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
      user: {
        id: row.user_id,
        username: row.username,
        email: row.email,
        name: row.name
      }
    }))

    const total = parseInt(totalResult.rows[0].count)

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static getClientInfo(req: any) {
    return {
      ipAddress: req.headers['x-forwarded-for'] || 
                req.connection?.remoteAddress || 
                req.socket?.remoteAddress ||
                req.ip,
      userAgent: req.headers['user-agent']
    }
  }
}
