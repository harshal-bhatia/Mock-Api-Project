import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { Mock } from '@/lib/types'

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const raw = await redis.get(`mock:${id}`)
    if (!raw) {
      return NextResponse.json({ error: 'Mock not found or expired' }, { status: 404 })
    }
    const mock: Mock = typeof raw === 'string' ? JSON.parse(raw) : raw
    return NextResponse.json(mock)
  } catch (err) {
    console.error('[GET /api/mocks/:id]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const raw = await redis.get(`mock:${id}`)
    if (!raw) {
      return NextResponse.json({ error: 'Mock not found' }, { status: 404 })
    }
    const mock: Mock = typeof raw === 'string' ? JSON.parse(raw) : raw

    await Promise.all([
      redis.del(`mock:${id}`),
      redis.del(`mock:slug:${mock.slug}`),
      redis.del(`mock:logs:${id}`),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/mocks/:id]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
