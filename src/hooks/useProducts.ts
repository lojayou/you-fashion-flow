
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface Product {
  id: string
  name: string
  sku: string
  product_code: string | null
  sale_price: number
  stock: number
  color: string | null
  size: string | null
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
          product_code,
          sale_price,
          stock,
          color,
          size,
          description,
          status,
          category,
          brand
        `)
        .eq('status', 'active')
        .order('name')

      if (error) {
        throw error
      }

      return products || []
    },
    staleTime: 30000,
    gcTime: 60000,
  })
}
