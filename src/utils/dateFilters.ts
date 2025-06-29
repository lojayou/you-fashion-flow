
export type TimeFilterOption = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'this-year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

export function getDateRangeFromPeriod(
  period: TimeFilterOption, 
  customDates?: DateRange
): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'today':
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      return {
        from: yesterday,
        to: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    case 'this-week':
      const startOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Sunday
      startOfWeek.setDate(today.getDate() + diff)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      return {
        from: startOfWeek,
        to: endOfWeek
      }
    
    case 'this-month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)
      
      return {
        from: startOfMonth,
        to: endOfMonth
      }
    
    case 'this-year':
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const endOfYear = new Date(today.getFullYear(), 11, 31)
      endOfYear.setHours(23, 59, 59, 999)
      
      return {
        from: startOfYear,
        to: endOfYear
      }
    
    case 'custom':
      if (customDates) {
        return {
          from: new Date(customDates.from.getFullYear(), customDates.from.getMonth(), customDates.from.getDate()),
          to: new Date(customDates.to.getFullYear(), customDates.to.getMonth(), customDates.to.getDate(), 23, 59, 59, 999)
        }
      }
      // Fallback to today if no custom dates provided
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    
    default:
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
  }
}
