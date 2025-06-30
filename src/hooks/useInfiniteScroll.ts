
import { useState, useEffect, useCallback } from 'react'

interface UseInfiniteScrollProps {
  items: any[]
  itemsPerPage?: number
}

export const useInfiniteScroll = ({ items, itemsPerPage = 20 }: UseInfiniteScrollProps) => {
  const [displayedItems, setDisplayedItems] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    // Reset when items change
    const initialItems = items.slice(0, itemsPerPage)
    setDisplayedItems(initialItems)
    setCurrentPage(1)
    setHasMore(items.length > itemsPerPage)
  }, [items, itemsPerPage])

  const loadMore = useCallback(() => {
    if (!hasMore) return

    const nextPage = currentPage + 1
    const startIndex = (nextPage - 1) * itemsPerPage
    const endIndex = nextPage * itemsPerPage
    const newItems = items.slice(startIndex, endIndex)

    if (newItems.length > 0) {
      setDisplayedItems(prev => [...prev, ...newItems])
      setCurrentPage(nextPage)
      setHasMore(endIndex < items.length)
    } else {
      setHasMore(false)
    }
  }, [items, currentPage, itemsPerPage, hasMore])

  return { displayedItems, hasMore, loadMore }
}
