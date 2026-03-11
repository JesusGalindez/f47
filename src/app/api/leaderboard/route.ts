import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 })
    }

    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(req: Request) {
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 })
    }

    try {
        const body = await req.json()
        const { name, score, level, wave, date } = body

        if (!name || score == null || level == null || wave == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('leaderboard')
            .insert([{ name, score, level, wave, date: date || new Date().toISOString() }])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data[0])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
