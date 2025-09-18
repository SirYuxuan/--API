// Upstash Redis REST API 客户端
class UpstashRedis {
  private url: string
  private token: string

  constructor() {
    this.url = process.env.UPSTASH_REDIS_REST_URL || ''
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || ''
  }

  private async request(command: string, ...args: any[]) {
    const response = await fetch(`${this.url}/${command}/${args.join('/')}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Redis request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.request('get', key)
      return result.result
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.request('setex', key, ttl, value)
      } else {
        await this.request('set', key, value)
      }
      return true
    } catch (error) {
      console.error('Redis set error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.request('del', key)
      return true
    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.request('exists', key)
      return result.result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.request('flushall')
      return true
    } catch (error) {
      console.error('Redis flush error:', error)
      return false
    }
  }
}

export const upstashRedis = new UpstashRedis()
export default upstashRedis
