
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface ProductWithDetails {
  id: string
  name: string
  sku: string
  sale_price: number
  stock: number
  category: string | null
  brand: string | null
  colors: string[]
  sizes: string[]
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
          sale_price,
          stock,
          colors,
          sizes,
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
        sale_price: product.sale_price,
        stock: product.stock || 0,
        category: product.category || null,
        brand: product.brand || null,
        colors: product.colors || [],
        sizes: product.sizes || [],
        description: product.description
      }))
    },
    staleTime: 30000,
    gcTime: 60000,
  })
}
