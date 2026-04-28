'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useListMocks, useDeleteMock } from '@/hooks/use-mocks-api'
import { useLocalMocks } from '@/hooks/use-local-mocks'
import { Clock, Plus, Database, ChevronRight, Trash2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function MocksPage() {
  const { mockIds, removeMockId, hydrated } = useLocalMocks()
  const { data: mocks = [], isLoading } = useListMocks(mockIds)
  const deleteMock = useDeleteMock()

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this mock endpoint?')) return
    deleteMock.mutate(id, { onSuccess: () => removeMockId(id) })
  }

  if (!hydrated || isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/3 mt-1" /></CardHeader>
              <CardContent><Skeleton className="h-12 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (mocks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <Database className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-mono font-bold">No mocks yet</h2>
        <p className="text-muted-foreground max-w-sm">
          Create your first mock endpoint and get a real URL returning AI-generated JSON in seconds.
        </p>
        <Link href="/">
          <Button className="font-mono mt-2">
            <Plus className="w-4 h-4 mr-2" /> CREATE YOUR FIRST MOCK
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-mono font-bold">My Mocks</h1>
        <Link href="/">
          <Button variant="outline" className="font-mono border-primary/40 text-primary hover:bg-primary/10">
            <Plus className="w-4 h-4 mr-2" /> NEW
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mocks.map((mock) => {
          const expired = new Date(mock.expiresAt) < new Date()
          return (
            <Card key={mock.id} className={`flex flex-col border-border bg-card hover:border-primary/40 transition-colors ${expired ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className={`font-mono text-[10px] ${!expired ? 'border-primary/30 text-primary' : 'text-muted-foreground'}`}>
                    {mock.inputMode.toUpperCase()}
                  </Badge>
                  <div className="flex items-center text-[11px] text-muted-foreground font-mono">
                    <Clock className="w-3 h-3 mr-1" />
                    {expired ? 'Expired' : formatDistanceToNow(new Date(mock.expiresAt), { addSuffix: true })}
                  </div>
                </div>
                <CardTitle className="font-mono text-sm truncate text-foreground/80">
                  {mock.path || `/api/mock/${mock.slug}`}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 pb-3">
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{mock.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center border border-border/50 rounded-md p-2 bg-background/40">
                  <div>
                    <div className="text-[9px] uppercase text-muted-foreground font-bold mb-0.5">Delay</div>
                    <div className="text-xs font-mono">{mock.delayMs}ms</div>
                  </div>
                  <div className="border-x border-border/50">
                    <div className="text-[9px] uppercase text-muted-foreground font-bold mb-0.5">Errors</div>
                    <div className="text-xs font-mono">{mock.errorRate}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-muted-foreground font-bold mb-0.5">Status</div>
                    <div className="text-xs font-mono text-primary">{mock.statusCode}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 gap-2">
                <Link href={`/mocks/${mock.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full font-mono text-xs h-8 hover:bg-primary/20 hover:text-primary">
                    <Activity className="w-3 h-3 mr-1.5" /> View
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleDelete(e, mock.id)}
                  disabled={deleteMock.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
