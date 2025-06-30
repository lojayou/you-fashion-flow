
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface ProductWithDetails {
  id: string
  name: string
  sku: string
  product_code: string | null
  sale_price: number
  stock: number
  category: string | null
  brand: string | null
  color: string | null
  size: string | null
  description?: string
}

export const useProductsWithDetails = () => {
  return useQuery({
    queryKey: ['products-with-details'],
    queryFn: async (): Promise<ProductWithDetails[]> => {
      const { data, error } = await supabase
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
          category,
          brand
        `)
        .eq('status', 'active')
        .order('name')

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      return data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        product_code: product.product_code || null,
        sale_price: product.sale_price,
        stock: product.stock || 0,
        category: product.category || null,
        brand: product.brand || null,
        color: product.color || null,
        size: product.size || null,
        description: product.description
      }))
    },
    staleTime: 30000,
    gcTime: 60000,
  })
}
