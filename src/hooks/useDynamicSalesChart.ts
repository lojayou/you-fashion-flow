
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
  total_sales: number
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
      console.log('Fetching sales data with grouping:', grouping)
      console.log('Date range:', dateRange)
      
      // Buscar pedidos com status correto (usando apenas status válidos do enum)
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .in('status', ['delivered', 'shipped']) // Apenas status válidos que indicam vendas concluídas
      
      if (error) {
        console.error('Error fetching orders:', error)
        throw error
      }

      console.log('Orders found:', orders?.length || 0)
      
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

  // Aggregate actual sales data with timezone conversion
  orders.forEach(order => {
    // Converter para timezone do Brasil
    const orderDate = new Date(order.created_at)
    const brasilOffset = -3 * 60 // UTC-3 em minutos
    const localDate = new Date(orderDate.getTime() + brasilOffset * 60 * 1000)
    
    const key = getGroupingKey(localDate, grouping)
    const currentValue = dataMap.get(key) || 0
    dataMap.set(key, currentValue + parseFloat(order.total_amount.toString()))
  })

  console.log('Generated data map:', Array.from(dataMap.entries()))

  // Convert to array and sort chronologically
  return Array.from(dataMap.entries())
    .map(([label, total_sales]) => ({
      label,
      total_sales: Math.round(total_sales * 100) / 100,
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
      // Para período de um dia, inicializar apenas as horas desse dia
      const startHour = current.getHours()
      const endHour = end.getHours()
      
      if (current.toDateString() === end.toDateString()) {
        // Mesmo dia - apenas as horas do período
        for (let hour = startHour; hour <= endHour; hour++) {
          const key = hour.toString().padStart(2, '0') + ':00'
          dataMap.set(key, 0)
        }
      } else {
        // Dias diferentes - todas as 24 horas
        for (let hour = 0; hour < 24; hour++) {
          const key = hour.toString().padStart(2, '0') + ':00'
          dataMap.set(key, 0)
        }
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
      const startOfWeek = getProperMonday(new Date(current))
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
      const monday = getProperMonday(date)
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

function getProperMonday(date: Date): Date {
  const monday = new Date(date)
  const dayOfWeek = date.getDay()
  
  // Ajustar para segunda-feira (1) ser o primeiro dia da semana
  // Se for domingo (0), voltar 6 dias; senão, voltar (dayOfWeek - 1) dias
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  monday.setDate(date.getDate() - daysToSubtract)
  
  // Garantir que seja o início do dia
  monday.setHours(0, 0, 0, 0)
  
  return monday
}
