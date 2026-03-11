import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL || ''

// Export minimal client or null if not configured
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null
