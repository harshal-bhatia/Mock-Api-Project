import { NextRequest, NextResponse } from 'next/server'
import { redis, MOCK_TTL_SECONDS } from '@/lib/redis'
import { generateMockData } from '@/lib/ai'
import type { Mock } from '@/lib/types'

type Context = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const raw = await redis.get(`mock:${id}`)
    if (!raw) {
      return NextResponse.json({ error: 'Mock not found or expired' }, { status: 404 })
    }
    const mock: Mock = typeof raw === 'string' ? JSON.parse(raw) : raw

    const generatedData = await generateMockData(
      mock.description,
      mock.inputMode,
      mock.schemaInput
    )

    const updated: Mock = { ...mock, generatedData }
    await redis.set(`mock:${id}`, JSON.stringify(updated), { ex: MOCK_TTL_SECONDS })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[POST /api/mocks/:id/regenerate]', err)
    return NextResponse.json({ error: 'Failed to regenerate' }, { status: 500 })
  }
}
