import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { RequestLog } from '@/lib/types'

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const raw = await redis.lrange(`mock:logs:${id}`, 0, 49)

    const logs: RequestLog[] = raw
      .map((item) => (typeof item === 'string' ? JSON.parse(item) : item))
      .reverse()

    return NextResponse.json(logs)
  } catch (err) {
    console.error('[GET /api/mocks/:id/logs]', err)
    return NextResponse.json([], { status: 200 })
  }
}
