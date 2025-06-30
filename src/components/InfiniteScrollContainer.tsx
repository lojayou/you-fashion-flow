
import { useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollContainerProps {
  children: React.ReactNode
  hasMore: boolean
  loadMore: () => void
  loading?: boolean
}

export function InfiniteScrollContainer({ 
  children, 
  hasMore, 
  loadMore, 
  loading = false 
}: InfiniteScrollContainerProps) {
  const observerRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, loadMore, loading])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    })

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <>
      {children}
      <div ref={observerRef} className="flex justify-center py-4">
        {loading && <Loader2 className="h-6 w-6 animate-spin" />}
        {hasMore && !loading && (
          <div className="text-sm text-muted-foreground">Carregando mais produtos...</div>
        )}
        {!hasMore && (
          <div className="text-sm text-muted-foreground">Todos os produtos foram carregados</div>
        )}
      </div>
    </>
  )
}
