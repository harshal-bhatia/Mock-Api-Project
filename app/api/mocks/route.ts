import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { redis, MOCK_TTL_SECONDS } from '@/lib/redis'
import { generateMockData } from '@/lib/ai'
import type { Mock } from '@/lib/types'

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 10)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, inputMode, schemaInput, path, delayMs, errorRate, statusCode } = body

    if (inputMode === 'plain' && (!description || description.trim().length < 3)) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    if (inputMode === 'schema' && (!schemaInput || schemaInput.trim().length === 0)) {
      return NextResponse.json({ error: 'Schema input is required' }, { status: 400 })
    }

    // ── 1. Ask Claude to generate realistic data ─────────────────────────
    const generatedData = await generateMockData(
      description ?? '',
      inputMode ?? 'plain',
      schemaInput
    )

    // ── 2. Build the mock object ─────────────────────────────────────────
    const id = randomUUID()
    const slug = generateSlug()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + MOCK_TTL_SECONDS * 1000)

    const mock: Mock = {
      id,
      slug,
      description: description ?? '',
      inputMode: inputMode ?? 'plain',
      schemaInput: inputMode === 'schema' ? schemaInput : undefined,
      path: path || undefined,
      delayMs: Number(delayMs) || 0,
      errorRate: Number(errorRate) || 0,
      statusCode: Number(statusCode) || 200,
      generatedData,
      liveUrl: `/api/mock/${slug}`,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    // ── 3. Save to Redis — two keys: by ID and by slug ───────────────────
    await redis.set(`mock:${id}`, JSON.stringify(mock), { ex: MOCK_TTL_SECONDS })
    await redis.set(`mock:slug:${slug}`, id, { ex: MOCK_TTL_SECONDS })

    return NextResponse.json(mock, { status: 201 })
  } catch (err) {
    console.error('[POST /api/mocks]', err)
    const message = err instanceof Error ? err.message : 'Failed to create mock'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
