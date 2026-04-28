import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";
import type { Mock, RequestLog } from "@/lib/types";

type Context = { params: Promise<{ slug: string; path?: string[] }> };

async function handler(req: NextRequest, { params }: Context) {
  const start = Date.now();
  const { slug } = await params;

  const mockId = await redis.get<string>(`mock:slug:${slug}`);
  if (!mockId) {
    return NextResponse.json(
      { error: "Mock endpoint not found or has expired" },
      { status: 404 },
    );
  }

  const raw = await redis.get(`mock:${mockId}`);
  if (!raw) {
    return NextResponse.json(
      { error: "Mock endpoint not found or has expired" },
      { status: 404 },
    );
  }
  const mock: Mock = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (mock.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, mock.delayMs));
  }

  if (mock.errorRate > 0 && Math.random() * 100 < mock.errorRate) {
    return NextResponse.json(
      { error: "Internal Server Error", code: "MOCK_SIMULATED_ERROR" },
      { status: 500 },
    );
  }

  const responseTimeMs = Date.now() - start;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    null;

  const log: RequestLog = {
    id: randomUUID(),
    method: req.method,
    timestamp: new Date().toISOString(),
    ip,
    responseTimeMs,
  };

  redis
    .lpush(`mock:logs:${mockId}`, JSON.stringify(log))
    .then(() => redis.ltrim(`mock:logs:${mockId}`, 0, 49))
    .catch(console.error);

  return NextResponse.json(mock.generatedData, {
    status: mock.statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "X-MockApi-Slug": slug,
      "X-MockApi-Delay": String(mock.delayMs),
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
