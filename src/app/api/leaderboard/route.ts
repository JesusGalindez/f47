import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

export async function GET() {
    if (!sql) {
        return NextResponse.json({ error: 'Neon database not configured' }, { status: 501 })
    }

    try {
        const data = await sql`
      SELECT name, score, level, wave, date
      FROM leaderboard
      ORDER BY score DESC
      LIMIT 10
    `
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    if (!sql) {
        return NextResponse.json({ error: 'Neon database not configured' }, { status: 501 })
    }

    try {
        const body = await req.json()
        const { name, score, level, wave, date } = body

        if (!name || score == null || level == null || wave == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const insertedData = await sql`
      INSERT INTO leaderboard (name, score, level, wave, date)
      VALUES (${name}, ${score}, ${level}, ${wave}, ${date || new Date().toISOString()})
      RETURNING *
    `

        return NextResponse.json(insertedData[0])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
