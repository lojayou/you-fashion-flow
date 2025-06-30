
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
      console.log('🔍 Buscando produtos com detalhes de categoria e marca...')
      
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
          categories!left(name),
          brands!left(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        throw error
      }

      console.log('✅ Produtos encontrados:', data?.length || 0)

      return (data || []).map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sale_price: product.sale_price,
        stock: product.stock,
        category: product.categories?.name || null,
        brand: product.brands?.name || null,
        colors: product.colors || [],
        sizes: product.sizes || [],
        description: product.description
      }))
    },
    staleTime: 30000,
    gcTime: 60000,
  })
}
