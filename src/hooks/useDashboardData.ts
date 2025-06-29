
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useDashboardData() {
  // Buscar estatísticas de condicionais
  const { data: conditionalStats } = useQuery({
    queryKey: ['conditional-stats'],
    queryFn: async () => {
      const { data: conditionals, error } = await supabase
        .from('conditionals')
        .select('total_value, status, due_date')
      
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

  // Buscar estatísticas de pedidos do dia
  const { data: orderStats } = useQuery({
    queryKey: ['order-stats-today'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', today.toISOString())
      
      if (error) throw error

      const totalSales = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount.toString()), 0) || 0
      const totalOrders = orders?.length || 0

      return { totalSales, totalOrders }
    }
  })

  // Buscar produtos com estoque baixo
  const { data: lowStockCount } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select('stock, min_stock')
        .lte('stock', supabase.rpc('min_stock'))
      
      if (error) {
        // Fallback query se RPC não funcionar
        const { data: allProducts } = await supabase
          .from('products')
          .select('stock, min_stock')
        
        const lowStock = allProducts?.filter(p => 
          (p.stock || 0) <= (p.min_stock || 5)
        ).length || 0
        
        return lowStock
      }

      return products?.length || 0
    }
  })

  // Buscar condicionais recentes
  const { data: recentConditionals } = useQuery({
    queryKey: ['recent-conditionals'],
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
          conditional_items(quantity)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
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
