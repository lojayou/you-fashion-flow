
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
  category?: string
  brand?: string
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          sale_price,
          stock,
          colors,
          sizes,
          description,
          status,
          category,
          brand
        `)
        .eq('status', 'active')
        .order('name')

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        throw error
      }

      return products || []
    },
    staleTime: 30000,
    gcTime: 60000,
  })
}
