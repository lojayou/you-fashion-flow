
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface Product {
  id: string
  name: string
  sku: string
  sale_price: number
  stock: number
  colors: string[]
  sizes: string[]
  description?: string
  status: 'active' | 'inactive'
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      console.log('Buscando produtos do banco de dados...')
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, sale_price, stock, colors, sizes, description, status')
        .eq('status', 'active')
        .gt('stock', 0)
        .order('name')

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        throw error
      }

      console.log('Produtos encontrados:', data)
      return data || []
    },
  })
}
