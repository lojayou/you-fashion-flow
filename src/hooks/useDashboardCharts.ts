
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { TimeFilterOption, DateRange, getDateRangeFromPeriod, shouldShowHourlyData } from '@/utils/dateFilters'

interface DashboardChartsOptions {
  period?: TimeFilterOption
  customDates?: DateRange
}

export function useDashboardCharts(options: DashboardChartsOptions = {}) {
  const { period = 'today', customDates } = options
  const dateRange = getDateRangeFromPeriod(period, customDates)
  const isHourlyData = shouldShowHourlyData(period)

  // Dados de vendas com filtro de data - apenas pedidos finalizados
  const { data: salesData } = useQuery({
    queryKey: ['sales-chart-data', period, customDates],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .in('status', ['delivered', 'completed']) // Pedidos finalizados
      
      if (error) throw error

      if (isHourlyData) {
        // Para hoje e ontem, mostrar dados por hora
        const hourlySales = new Map<string, number>()
        
        // Inicializar todas as horas do dia (00:00 até 23:00)
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString().padStart(2, '0') + ':00'
          hourlySales.set(hourStr, 0)
        }
        
        // Somar vendas por hora
        orders?.forEach(order => {
          const orderDate = new Date(order.created_at)
          const hourStr = orderDate.getHours().toString().padStart(2, '0') + ':00'
          const currentValue = hourlySales.get(hourStr) || 0
          hourlySales.set(hourStr, currentValue + parseFloat(order.total_amount.toString()))
        })
        
        return Array.from(hourlySales.entries()).map(([hour, sales]) => ({
          date: hour,
          sales: Math.round(sales * 100) / 100
        }))
      } else {
        // Para outros períodos, mostrar dados diários
        const dailySales = new Map<string, number>()
        
        // Inicializar todos os dias do período selecionado
        const currentDate = new Date(dateRange.from)
        const endDate = new Date(dateRange.to)
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0]
          dailySales.set(dateStr, 0)
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        // Somar vendas por dia
        orders?.forEach(order => {
          const dateStr = new Date(order.created_at).toISOString().split('T')[0]
          if (dailySales.has(dateStr)) {
            const currentValue = dailySales.get(dateStr) || 0
            dailySales.set(dateStr, currentValue + parseFloat(order.total_amount.toString()))
          }
        })
        
        // Retornar dados ordenados cronologicamente
        return Array.from(dailySales.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, sales]) => ({
            date,
            sales: Math.round(sales * 100) / 100
          }))
      }
    }
  })

  // Dados de métodos de pagamento - apenas pedidos finalizados
  const { data: paymentData } = useQuery({
    queryKey: ['payment-methods-chart-data', period, customDates],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('payment_method, total_amount')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .in('status', ['delivered', 'completed']) // Pedidos finalizados
      
      if (error) throw error

      const paymentMethods = new Map<string, { count: number, value: number }>()
      
      orders?.forEach(order => {
        const method = order.payment_method || 'Não informado'
        const current = paymentMethods.get(method) || { count: 0, value: 0 }
        paymentMethods.set(method, {
          count: current.count + 1,
          value: current.value + parseFloat(order.total_amount.toString())
        })
      })
      
      return Array.from(paymentMethods.entries()).map(([method, data], index) => ({
        method,
        value: Math.round(data.value * 100) / 100,
        count: data.count,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`
      }))
    }
  })

  // Dados de condicionais com filtro de data
  const { data: conditionalData } = useQuery({
    queryKey: ['conditional-chart-data', period, customDates],
    queryFn: async () => {
      const { data: conditionals, error } = await supabase
        .from('conditionals')
        .select('status, due_date, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
      
      if (error) throw error

      if (isHourlyData) {
        // Para hoje e ontem, mostrar dados por hora
        const hourlyConditionals = new Map<string, { active: number, overdue: number }>()
        
        // Inicializar todas as horas do dia
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString().padStart(2, '0') + ':00'
          hourlyConditionals.set(hourStr, { active: 0, overdue: 0 })
        }
        
        conditionals?.forEach(conditional => {
          const conditionalDate = new Date(conditional.created_at)
          const hourStr = conditionalDate.getHours().toString().padStart(2, '0') + ':00'
          const current = hourlyConditionals.get(hourStr) || { active: 0, overdue: 0 }
          
          if (conditional.status === 'overdue' || 
              (conditional.status === 'active' && new Date(conditional.due_date) < new Date())) {
            current.overdue += 1
          } else {
            current.active += 1
          }
          
          hourlyConditionals.set(hourStr, current)
        })
        
        return Array.from(hourlyConditionals.entries()).map(([hour, data]) => ({
          date: hour,
          active: data.active,
          overdue: data.overdue
        }))
      } else {
        // Para outros períodos, mostrar dados diários
        const dailyConditionals = new Map<string, { active: number, overdue: number }>()
        
        // Inicializar todos os dias do período
        const currentDate = new Date(dateRange.from)
        const endDate = new Date(dateRange.to)
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0]
          dailyConditionals.set(dateStr, { active: 0, overdue: 0 })
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        conditionals?.forEach(conditional => {
          const dateStr = new Date(conditional.created_at).toISOString().split('T')[0]
          if (dailyConditionals.has(dateStr)) {
            const current = dailyConditionals.get(dateStr) || { active: 0, overdue: 0 }
            
            if (conditional.status === 'overdue' || 
                (conditional.status === 'active' && new Date(conditional.due_date) < new Date())) {
              current.overdue += 1
            } else {
              current.active += 1
            }
            
            dailyConditionals.set(dateStr, current)
          }
        })
        
        return Array.from(dailyConditionals.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({
            date,
            active: data.active,
            overdue: data.overdue
          }))
      }
    }
  })

  return {
    salesData: salesData || [],
    paymentData: paymentData || [],
    conditionalData: conditionalData || [],
    isHourlyData
  }
}
