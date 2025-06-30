
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
      console.log('🔍 Iniciando busca de produtos...')
      
      // Primeiro, vamos verificar se existem produtos na tabela
      const { data: productsCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (countError) {
        console.error('❌ Erro ao contar produtos:', countError)
      } else {
        console.log('📊 Total de produtos ativos na tabela:', productsCount)
      }

      // Agora vamos buscar os produtos com relacionamentos
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
          category_id,
          brand_id,
          categories(name),
          brands(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar produtos:', error)
        console.error('❌ Detalhes completos do erro:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('✅ Produtos encontrados:', data?.length || 0)
      console.log('📋 Dados brutos retornados:', JSON.stringify(data, null, 2))

      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum produto encontrado ou dados vazios')
        return []
      }

      const mappedProducts = data.map(product => {
        console.log('🔄 Mapeando produto:', {
          id: product.id,
          name: product.name,
          category_id: product.category_id,
          brand_id: product.brand_id,
          categories: product.categories,
          brands: product.brands
        })

        return {
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
        }
      })

      console.log('✅ Produtos mapeados:', mappedProducts.length)
      console.log('📋 Produtos finais:', JSON.stringify(mappedProducts, null, 2))

      return mappedProducts
    },
    staleTime: 30000,
    gcTime: 60000,
  })
}
