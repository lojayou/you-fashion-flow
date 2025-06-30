
import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollContainerProps {
  children: React.ReactNode
  hasMore: boolean
  loadMore: () => void
  className?: string
}

export function InfiniteScrollContainer({ 
  children, 
  hasMore, 
  loadMore, 
  className 
}: InfiniteScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && hasMore) {
        loadMore()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadMore])

  return (
    <div 
      ref={containerRef} 
      className={`max-h-[600px] overflow-y-auto ${className || ''}`}
    >
      {children}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
