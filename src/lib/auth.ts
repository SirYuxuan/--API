import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './db'

export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER'
}

export interface User {
  id: string
  email: string
  username: string
  password: string
  name: string | null
  avatar: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
  private static readonly SALT_ROUNDS = 12

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '7d' })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload
    } catch {
      return null
    }
  }

  static async register(
    email: string,
    username: string,
    password: string,
    name?: string
  ): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id FROM admin_users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUserResult.rows.length > 0) {
      throw new Error('用户已存在')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Create user
    const userResult = await query(
      `INSERT INTO admin_users (id, email, username, password, name, role, is_active, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING id, email, username, name, avatar, role, is_active, created_at, updated_at`,
      [email, username, hashedPassword, name || username, UserRole.USER]
    )

    const user = userResult.rows[0]

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return { user, token }
  }

  static async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Find user
    const userResult = await query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      throw new Error('用户不存在')
    }

    const user = userResult.rows[0]

    if (!user.is_active) {
      throw new Error('账户已被禁用')
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw new Error('密码错误')
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  }

  static async validateToken(token: string): Promise<Omit<User, 'password'> | null> {
    const payload = this.verifyToken(token)
    if (!payload) return null

    const userResult = await query(
      `SELECT id, email, username, name, avatar, role, is_active, created_at, updated_at
       FROM admin_users WHERE id = $1`,
      [payload.userId]
    )

    if (userResult.rows.length === 0) return null

    const user = userResult.rows[0]
    if (!user.is_active) return null

    return user
  }

  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.MODERATOR]: 2,
      [UserRole.ADMIN]: 3
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  static requireAuth(handler: any) {
    return async (req: any, res: any) => {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: '未提供认证令牌' })
      }

      const user = await this.validateToken(token)
      if (!user) {
        return res.status(401).json({ error: '无效的认证令牌' })
      }

      req.user = user
      return handler(req, res)
    }
  }

  static requireRole(requiredRole: UserRole) {
    return (handler: any) => {
      return async (req: any, res: any) => {
        if (!req.user) {
          return res.status(401).json({ error: '未认证' })
        }

        if (!this.hasPermission(req.user.role, requiredRole)) {
          return res.status(403).json({ error: '权限不足' })
        }

        return handler(req, res)
      }
    }
  }
}
