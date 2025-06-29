
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { TimeFilterOption, DateRange, getDateRangeFromPeriod } from '@/utils/dateFilters'

interface DashboardDataOptions {
  period?: TimeFilterOption
  customDates?: DateRange
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  const { period = 'today', customDates } = options
  const dateRange = getDateRangeFromPeriod(period, customDates)

  // Buscar estatísticas de condicionais
  const { data: conditionalStats } = useQuery({
    queryKey: ['conditional-stats', period, customDates],
    queryFn: async () => {
      const { data: conditionals, error } = await supabase
        .from('conditionals')
        .select('total_value, status, due_date, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
      
      if (error) throw error

      const now = new Date()
      const total = conditionals?.length || 0
      const totalValue = conditionals?.reduce((sum, c) => sum + parseFloat(c.total_value.toString()), 0) || 0
      const overdue = conditionals?.filter(c => 
        c.status === 'overdue' || (c.status === 'active' && new Date(c.due_date) < now)
      ).length || 0

      return { total, totalValue, overdue }
    }
  })

  // Buscar estatísticas de pedidos
  const { data: orderStats } = useQuery({
    queryKey: ['order-stats', period, customDates],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
      
      if (error) throw error

      const totalSales = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0) || 0
      const totalOrders = orders?.length || 0

      return { totalSales, totalOrders }
    }
  })

  // Buscar produtos com estoque baixo - esta consulta não precisa de filtro de data
  const { data: lowStockCount } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select('stock, min_stock')
      
      if (error) throw error

      const lowStock = products?.filter(p => 
        (p.stock || 0) <= (p.min_stock || 5)
      ).length || 0
      
      return lowStock
    }
  })

  // Buscar condicionais recentes com filtro de data
  const { data: recentConditionals } = useQuery({
    queryKey: ['recent-conditionals', period, customDates],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conditionals')
        .select(`
          id,
          customer_name,
          customer_phone,
          total_value,
          due_date,
          status,
          created_at,
          conditional_items(quantity)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error

      return data?.map(conditional => ({
        id: conditional.id,
        customerName: conditional.customer_name,
        phone: conditional.customer_phone,
        items: conditional.conditional_items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        value: parseFloat(conditional.total_value.toString()),
        dueDate: conditional.due_date,
        status: conditional.status === 'overdue' || 
                (conditional.status === 'active' && new Date(conditional.due_date) < new Date()) 
                ? 'overdue' : 'active'
      })) || []
    }
  })

  return {
    conditionalStats: conditionalStats || { total: 0, totalValue: 0, overdue: 0 },
    orderStats: orderStats || { totalSales: 0, totalOrders: 0 },
    lowStockCount: lowStockCount || 0,
    recentConditionals: recentConditionals || [],
    isLoading: false
  }
}
