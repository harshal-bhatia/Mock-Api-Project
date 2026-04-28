'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  useGetMock, useDeleteMock, useRegenerateMock, useGetMockLogs
} from '@/hooks/use-mocks-api'
import { useLocalMocks } from '@/hooks/use-local-mocks'
import {
  Copy, Trash2, RefreshCw, Activity, Terminal,
  AlertTriangle, CheckCircle, ArrowLeft, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function highlightJson(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-blue-400'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'text-cyan-300' : 'text-green-400'
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400'
      } else if (/null/.test(match)) {
        cls = 'text-gray-500'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export default function MockDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { removeMockId } = useLocalMocks()
  const [copied, setCopied] = useState<string | null>(null)

  const { data: mock, isLoading, isError } = useGetMock(id)
  const { data: logs = [] } = useGetMockLogs(id)
  const deleteMock = useDeleteMock()
  const regenerateMock = useRegenerateMock()

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = () => {
    if (!confirm('Delete this mock? This cannot be undone.')) return
    deleteMock.mutate(id, {
      onSuccess: () => {
        removeMockId(id)
        router.push('/mocks')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError || !mock) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-4">
        <AlertTriangle className="w-14 h-14 text-destructive mx-auto" />
        <h1 className="text-2xl font-mono font-bold">Mock Not Found</h1>
        <p className="text-muted-foreground">This mock does not exist or has expired (mocks live for 24 hours).</p>
        <Button onClick={() => router.push('/mocks')} variant="outline" className="font-mono mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO MOCKS
        </Button>
      </div>
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const mockUrl = `${appUrl}${mock.liveUrl}`
  const curlSnippet = `curl -X GET "${mockUrl}"`
  const fetchSnippet = `const res = await fetch("${mockUrl}");\nconst data = await res.json();\nconsole.log(data);`
  const expired = new Date(mock.expiresAt) < new Date()

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <button onClick={() => router.push('/mocks')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors mb-1">
            <ArrowLeft className="w-3 h-3" /> All Mocks
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-mono font-bold">{mock.path || `/mock/${mock.slug}`}</h1>
            <Badge variant="outline" className="font-mono border-primary/30 text-primary">HTTP {mock.statusCode}</Badge>
            {expired && <Badge variant="destructive" className="font-mono text-[10px]">EXPIRED</Badge>}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">{mock.description}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            Expires {format(new Date(mock.expiresAt), 'MMM d, yyyy HH:mm')}
            {mock.delayMs > 0 && <span className="ml-3">· {mock.delayMs}ms delay</span>}
            {mock.errorRate > 0 && <span>· {mock.errorRate}% error rate</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => regenerateMock.mutate(id)}
            disabled={regenerateMock.isPending}
            className="font-mono text-xs border-border hover:border-primary/50 hover:text-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${regenerateMock.isPending ? 'animate-spin' : ''}`} />
            REGENERATE
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMock.isPending}
            className="font-mono text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" /> DELETE
          </Button>
        </div>
      </div>

      {/* Live URL card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 space-y-5">
          {/* Live URL row */}
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-widest mb-2">
              Live Endpoint URL
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-background border border-border rounded-md px-4 py-2.5 font-mono text-sm text-primary overflow-x-auto whitespace-nowrap">
                {mockUrl}
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleCopy(mockUrl, 'URL')}
                className="flex-shrink-0"
                title="Copy URL"
              >
                {copied === 'URL' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* cURL + fetch snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-widest mb-2">cURL</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 bg-background/70 border border-border/60 rounded-md px-3 py-2 font-mono text-xs overflow-x-auto whitespace-nowrap">
                  <span className="text-muted-foreground mr-1">$</span>
                  <span className="text-green-400">curl</span>
                  <span className="text-foreground/70"> -X GET </span>
                  <span className="text-yellow-300">&quot;{mockUrl}&quot;</span>
                </div>
                <Button variant="secondary" size="icon" className="flex-shrink-0" onClick={() => handleCopy(curlSnippet, 'cURL')}>
                  {copied === 'cURL' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-widest mb-2">JavaScript (fetch)</div>
              <div className="flex items-start gap-2">
                <pre className="flex-1 min-w-0 bg-background/70 border border-border/60 rounded-md px-3 py-2 font-mono text-xs overflow-x-auto text-blue-300 whitespace-pre leading-relaxed">
                  {fetchSnippet}
                </pre>
                <Button variant="secondary" size="icon" className="flex-shrink-0 mt-0" onClick={() => handleCopy(fetchSnippet, 'fetch')}>
                  {copied === 'fetch' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* JSON Viewer */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" /> Response Payload
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs h-7 px-2"
              onClick={() => handleCopy(JSON.stringify(mock.generatedData, null, 2), 'JSON')}
            >
              {copied === 'JSON' ? <CheckCircle className="w-3 h-3 mr-1.5 text-green-400" /> : <Copy className="w-3 h-3 mr-1.5" />}
              COPY JSON
            </Button>
          </div>
          <div className="rounded-lg border border-border overflow-hidden bg-[#0d1117]">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-[#161b22] border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground">response.json</span>
            </div>
            <pre className="p-5 overflow-x-auto font-mono text-sm leading-6 text-gray-300 max-h-[500px] overflow-y-auto">
              <code dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(mock.generatedData, null, 2)) }} />
            </pre>
          </div>
        </div>

        {/* Request Logs */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-mono font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Request Logs
            {logs.length > 0 && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground font-normal">auto-refreshes</span>
          </h2>
          <Card className="border-border bg-card overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground font-mono">Waiting for requests...</p>
                <p className="text-xs text-muted-foreground/60">
                  Hit the live URL above with curl or fetch and logs will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary h-5">
                        {log.method}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[120px]">
                        {log.ip ?? 'unknown'}
                      </span>
                      <span className={`text-[11px] font-mono ${log.responseTimeMs > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {log.responseTimeMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
