
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { TimeFilterOption, DateRange, getDateRangeFromPeriod } from '@/utils/dateFilters'

interface DashboardChartsOptions {
  period?: TimeFilterOption
  customDates?: DateRange
}

export function useDashboardCharts(options: DashboardChartsOptions = {}) {
  const { period = 'today', customDates } = options
  const dateRange = getDateRangeFromPeriod(period, customDates)

  // Dados de vendas com filtro de data
  const { data: salesData } = useQuery({
    queryKey: ['sales-chart-data', period, customDates],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'delivered')
      
      if (error) throw error

      // Criar mapa de vendas diárias baseado no período
      const dailySales = new Map<string, number>()
      
      // Calcular quantos dias entre from e to
      const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      const maxDays = Math.min(daysDiff, 30) // Limitar a 30 dias para performance
      
      // Inicializar dias no período
      for (let i = 0; i < maxDays; i++) {
        const date = new Date(dateRange.from)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        dailySales.set(dateStr, 0)
      }
      
      // Somar vendas por dia
      orders?.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split('T')[0]
        const currentValue = dailySales.get(dateStr) || 0
        dailySales.set(dateStr, currentValue + parseFloat(order.total_amount.toString()))
      })
      
      return Array.from(dailySales.entries()).map(([date, sales]) => ({
        date,
        sales: Math.round(sales * 100) / 100
      }))
    }
  })

  // Dados de métodos de pagamento com filtro de data
  const { data: paymentData } = useQuery({
    queryKey: ['payment-methods-chart-data', period, customDates],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('payment_method, total_amount')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'delivered')
      
      if (error) throw error

      const paymentMethods = new Map<string, number>()
      
      orders?.forEach(order => {
        const method = order.payment_method || 'Não informado'
        const current = paymentMethods.get(method) || 0
        paymentMethods.set(method, current + parseFloat(order.total_amount.toString()))
      })
      
      return Array.from(paymentMethods.entries()).map(([method, value], index) => ({
        method,
        value: Math.round(value * 100) / 100,
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

      // Criar mapa de condicionais diárias baseado no período
      const dailyConditionals = new Map<string, { active: number, overdue: number }>()
      
      // Calcular quantos dias entre from e to
      const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      const maxDays = Math.min(daysDiff, 30) // Limitar a 30 dias para performance
      
      // Inicializar dias no período
      for (let i = 0; i < maxDays; i++) {
        const date = new Date(dateRange.from)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        dailyConditionals.set(dateStr, { active: 0, overdue: 0 })
      }
      
      conditionals?.forEach(conditional => {
        const dateStr = new Date(conditional.created_at).toISOString().split('T')[0]
        const current = dailyConditionals.get(dateStr) || { active: 0, overdue: 0 }
        
        if (conditional.status === 'overdue' || 
            (conditional.status === 'active' && new Date(conditional.due_date) < new Date())) {
          current.overdue += 1
        } else {
          current.active += 1
        }
        
        dailyConditionals.set(dateStr, current)
      })
      
      return Array.from(dailyConditionals.entries()).map(([date, data]) => ({
        date,
        active: data.active,
        overdue: data.overdue
      }))
    }
  })

  return {
    salesData: salesData || [],
    paymentData: paymentData || [],
    conditionalData: conditionalData || []
  }
}
