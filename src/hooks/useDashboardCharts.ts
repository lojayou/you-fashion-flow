
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useDashboardCharts() {
  // Dados de vendas dos últimos 7 dias
  const { data: salesData } = useQuery({
    queryKey: ['sales-chart-data'],
    queryFn: async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('status', 'delivered')
      
      if (error) throw error

      // Agrupar vendas por dia
      const dailySales = new Map<string, number>()
      
      // Inicializar todos os dias dos últimos 7 dias com 0
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
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

  // Dados de estoque por categoria
  const { data: stockData } = useQuery({
    queryKey: ['stock-chart-data'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          stock,
          min_stock,
          categories(name)
        `)
        .eq('status', 'active')
      
      if (error) throw error

      const categoryStock = new Map<string, { stock: number, lowStock: number }>()
      
      products?.forEach(product => {
        const categoryName = product.categories?.name || 'Sem Categoria'
        const current = categoryStock.get(categoryName) || { stock: 0, lowStock: 0 }
        
        current.stock += product.stock || 0
        if ((product.stock || 0) <= (product.min_stock || 5)) {
          current.lowStock += 1
        }
        
        categoryStock.set(categoryName, current)
      })
      
      return Array.from(categoryStock.entries()).map(([category, data]) => ({
        category,
        stock: data.stock,
        lowStock: data.lowStock
      }))
    }
  })

  // Dados de métodos de pagamento
  const { data: paymentData } = useQuery({
    queryKey: ['payment-methods-chart-data'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('payment_method, total_amount')
        .eq('status', 'delivered')
      
      if (error) throw error

      const paymentMethods = new Map<string, number>()
      
      orders?.forEach(order => {
        const method = order.payment_method || 'Não informado'
        const current = paymentMethods.get(method) || 0
        paymentMethods.set(method, current + parseFloat(order.total_amount.toString()))
      })
      
      const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']
      
      return Array.from(paymentMethods.entries()).map(([method, value], index) => ({
        method,
        value: Math.round(value * 100) / 100,
        fill: colors[index % colors.length]
      }))
    }
  })

  // Dados de condicionais dos últimos 7 dias
  const { data: conditionalData } = useQuery({
    queryKey: ['conditional-chart-data'],
    queryFn: async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: conditionals, error } = await supabase
        .from('conditionals')
        .select('status, due_date, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
      
      if (error) throw error

      // Agrupar condicionais por dia
      const dailyConditionals = new Map<string, { active: number, overdue: number }>()
      
      // Inicializar todos os dias dos últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
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
    stockData: stockData || [],
    paymentData: paymentData || [],
    conditionalData: conditionalData || []
  }
}
