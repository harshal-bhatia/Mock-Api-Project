export interface Mock {
  id: string
  slug: string
  description: string
  inputMode: 'plain' | 'schema'
  schemaInput?: string
  path?: string
  delayMs: number
  errorRate: number
  statusCode: number
  generatedData: unknown
  liveUrl: string
  createdAt: string
  expiresAt: string
}

export interface RequestLog {
  id: string
  method: string
  timestamp: string
  ip: string | null
  responseTimeMs: number
}
