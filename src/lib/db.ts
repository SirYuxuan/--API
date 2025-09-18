import { Pool } from 'pg'

const globalForDb = globalThis as unknown as {
  db: Pool | undefined
}

export const db = globalForDb.db ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

// 数据库查询辅助函数
export const query = async (text: string, params?: any[]) => {
  const client = await db.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export default db
