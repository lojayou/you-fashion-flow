
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { TimeFilterOption, DateRange, getDateRangeFromPeriod } from '@/utils/dateFilters'

interface DynamicSalesChartOptions {
  period?: TimeFilterOption
  customDates?: DateRange
}

type ChartGrouping = 'hour' | 'day' | 'week' | 'month'

interface ChartDataPoint {
  label: string
  value: number
  grouping: ChartGrouping
}

export function useDynamicSalesChart(options: DynamicSalesChartOptions = {}) {
  const { period = 'today', customDates } = options
  const dateRange = getDateRangeFromPeriod(period, customDates)

  // Determine the appropriate grouping based on the time period
  const getChartGrouping = (): ChartGrouping => {
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 1) return 'hour'  // Single day = hourly
    if (daysDiff <= 30) return 'day'  // Up to 30 days = daily
    if (daysDiff <= 120) return 'week' // Up to 4 months = weekly
    return 'month' // More than 4 months = monthly
  }

  const grouping = getChartGrouping()

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['dynamic-sales-chart', period, customDates, grouping],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'delivered')
      
      if (error) throw error

      return generateChartData(orders || [], dateRange, grouping)
    }
  })

  return {
    data: salesData || [],
    grouping,
    isLoading
  }
}

function generateChartData(
  orders: Array<{ total_amount: number; created_at: string }>,
  dateRange: DateRange,
  grouping: ChartGrouping
): ChartDataPoint[] {
  const dataMap = new Map<string, number>()

  // Initialize all periods with zero values
  initializePeriods(dataMap, dateRange, grouping)

  // Aggregate actual sales data
  orders.forEach(order => {
    const orderDate = new Date(order.created_at)
    const key = getGroupingKey(orderDate, grouping)
    const currentValue = dataMap.get(key) || 0
    dataMap.set(key, currentValue + parseFloat(order.total_amount.toString()))
  })

  // Convert to array and sort chronologically
  return Array.from(dataMap.entries())
    .map(([label, value]) => ({
      label,
      value: Math.round(value * 100) / 100,
      grouping
    }))
    .sort((a, b) => {
      // Sort by the actual date value for proper chronological order
      const dateA = parseGroupingKey(a.label, grouping)
      const dateB = parseGroupingKey(b.label, grouping)
      return dateA.getTime() - dateB.getTime()
    })
}

function initializePeriods(
  dataMap: Map<string, number>,
  dateRange: DateRange,
  grouping: ChartGrouping
) {
  const current = new Date(dateRange.from)
  const end = new Date(dateRange.to)

  switch (grouping) {
    case 'hour':
      // Initialize all hours of the day
      for (let hour = 0; hour < 24; hour++) {
        const key = hour.toString().padStart(2, '0') + ':00'
        dataMap.set(key, 0)
      }
      break

    case 'day':
      // Initialize all days in the range
      while (current <= end) {
        const key = current.toISOString().split('T')[0]
        dataMap.set(key, 0)
        current.setDate(current.getDate() + 1)
      }
      break

    case 'week':
      // Initialize all weeks in the range (Monday to Sunday)
      const startOfWeek = getMonday(new Date(current))
      current.setTime(startOfWeek.getTime())
      
      while (current <= end) {
        const weekEnd = new Date(current)
        weekEnd.setDate(current.getDate() + 6)
        const key = `${current.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`
        dataMap.set(key, 0)
        current.setDate(current.getDate() + 7)
      }
      break

    case 'month':
      // Initialize all months in the range
      current.setDate(1) // Start at first day of month
      while (current <= end) {
        const key = current.toISOString().substring(0, 7) // YYYY-MM format
        dataMap.set(key, 0)
        current.setMonth(current.getMonth() + 1)
      }
      break
  }
}

function getGroupingKey(date: Date, grouping: ChartGrouping): string {
  switch (grouping) {
    case 'hour':
      return date.getHours().toString().padStart(2, '0') + ':00'
    
    case 'day':
      return date.toISOString().split('T')[0]
    
    case 'week':
      const monday = getMonday(date)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return `${monday.toISOString().split('T')[0]} to ${sunday.toISOString().split('T')[0]}`
    
    case 'month':
      return date.toISOString().substring(0, 7) // YYYY-MM format
    
    default:
      return date.toISOString().split('T')[0]
  }
}

function parseGroupingKey(key: string, grouping: ChartGrouping): Date {
  switch (grouping) {
    case 'hour':
      const today = new Date()
      const [hour] = key.split(':')
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hour))
    
    case 'day':
      return new Date(key)
    
    case 'week':
      const [startDate] = key.split(' to ')
      return new Date(startDate)
    
    case 'month':
      return new Date(key + '-01')
    
    default:
      return new Date(key)
  }
}

function getMonday(date: Date): Date {
  const monday = new Date(date)
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Sunday being 0
  monday.setDate(date.getDate() + diff)
  return monday
}
