import upstashRedis from './upstash-redis'

export class CacheService {
  private static instance: CacheService
  private redis = upstashRedis

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      await this.redis.set(key, serialized, ttl)
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.redis.flush()
      return true
    } catch (error) {
      console.error('Cache flush error:', error)
      return false
    }
  }

  // Cache with automatic key generation
  async cache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    await this.set(key, data, ttl)
    return data
  }

  // Generate cache key
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`
  }
}

export const cache = CacheService.getInstance()
