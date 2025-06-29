
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
      console.log('🔍 Iniciando busca de produtos...')
      
      try {
        // Primeiro, vamos buscar todos os produtos para debug
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('id, name, sku, sale_price, stock, colors, sizes, description, status')

        console.log('📊 Query executada - Todos os produtos')
        
        if (allError) {
          console.error('❌ Erro ao buscar todos os produtos:', allError)
          throw allError
        }

        console.log('✅ Todos os produtos no banco:', allProducts)
        console.log('📈 Total de produtos no banco:', allProducts?.length || 0)
        
        if (allProducts && allProducts.length > 0) {
          console.log('📋 Detalhes dos produtos:')
          allProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - Status: ${product.status} - Estoque: ${product.stock}`)
          })
        }

        // Agora buscar apenas os produtos ativos
        const { data: activeProducts, error: activeError } = await supabase
          .from('products')
          .select('id, name, sku, sale_price, stock, colors, sizes, description, status')
          .eq('status', 'active')
          .order('name')

        console.log('📊 Query executada - Produtos ativos')

        if (activeError) {
          console.error('❌ Erro ao buscar produtos ativos:', activeError)
          throw activeError
        }

        console.log('✅ Produtos ativos encontrados:', activeProducts)
        console.log('📈 Total de produtos ativos:', activeProducts?.length || 0)
        console.log('📦 Produtos com estoque > 0:', activeProducts?.filter(p => p.stock > 0)?.length || 0)
        
        if (activeProducts && activeProducts.length > 0) {
          console.log('📋 Produtos ativos detalhados:')
          activeProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - Estoque: ${product.stock} - Preço: R$ ${product.sale_price}`)
            if (product.colors && product.colors.length > 0) {
              console.log(`    Cores: ${product.colors.join(', ')}`)
            }
            if (product.sizes && product.sizes.length > 0) {
              console.log(`    Tamanhos: ${product.sizes.join(', ')}`)
            }
          })
        }
        
        console.log('🎯 Retornando produtos para o componente:', activeProducts?.length || 0, 'produtos')
        
        return activeProducts || []
        
      } catch (error) {
        console.error('💥 Erro geral na busca de produtos:', error)
        throw error
      }
    },
    // Forçar refetch e evitar cache antigo
    staleTime: 0,
    gcTime: 0,
  })
}
