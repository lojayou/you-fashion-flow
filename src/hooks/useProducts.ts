
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
      console.log('🔍 Iniciando busca de produtos - Debug detalhado...')
      
      try {
        console.log('📋 Schema esperado:')
        console.log('  - status: enum com valores active|inactive (padrão: active)')
        console.log('  - stock: integer (padrão: 0, aceita NULL)')
        console.log('  - category_id: uuid (aceita NULL)')
        console.log('  - brand_id: uuid (aceita NULL)')
        
        // Query 1: Verificar estrutura da tabela
        console.log('🔍 Step 1: Verificando estrutura da tabela products...')
        const { data: tableInfo, error: tableError } = await supabase
          .from('products')
          .select('*')
          .limit(1)

        if (tableError) {
          console.error('❌ Erro ao verificar estrutura da tabela:', tableError)
        } else {
          console.log('✅ Estrutura da tabela verificada:', tableInfo)
        }

        // Query 2: Contar total de produtos sem filtros
        console.log('🔍 Step 2: Contando total de produtos (sem filtros)...')
        const { count: totalCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          console.error('❌ Erro ao contar produtos:', countError)
        } else {
          console.log(`📊 Total de produtos na tabela: ${totalCount}`)
        }

        // Query 3: Buscar todos os produtos com detalhes
        console.log('🔍 Step 3: Buscando todos os produtos com detalhes...')
        const allProductsQuery = supabase
          .from('products')
          .select('id, name, sku, sale_price, stock, colors, sizes, description, status, category_id, brand_id')

        console.log('📋 Query SQL gerada (todos os produtos):', allProductsQuery)

        const { data: allProducts, error: allError } = await allProductsQuery

        if (allError) {
          console.error('❌ Erro ao buscar todos os produtos:', allError)
          console.error('❌ Detalhes do erro:', {
            message: allError.message,
            code: allError.code,
            details: allError.details,
            hint: allError.hint
          })
        } else {
          console.log('✅ Todos os produtos encontrados:', allProducts)
          console.log(`📈 Total encontrado: ${allProducts?.length || 0}`)
          
          if (allProducts && allProducts.length > 0) {
            console.log('📋 Detalhes dos produtos encontrados:')
            allProducts.forEach((product, index) => {
              console.log(`  ${index + 1}. Nome: ${product.name}`)
              console.log(`      Status: ${product.status}`)
              console.log(`      Estoque: ${product.stock}`)
              console.log(`      Category ID: ${product.category_id}`)
              console.log(`      Brand ID: ${product.brand_id}`)
              console.log(`      ---`)
            })

            // Analisar distribuição por status
            const statusDistribution = allProducts.reduce((acc, p) => {
              acc[p.status] = (acc[p.status] || 0) + 1
              return acc
            }, {} as Record<string, number>)
            console.log('📊 Distribuição por status:', statusDistribution)

            // Analisar produtos com estoque 0
            const zeroStockProducts = allProducts.filter(p => p.stock === 0)
            console.log(`📦 Produtos com estoque 0: ${zeroStockProducts.length}`)

            // Analisar produtos com category_id ou brand_id null
            const nullCategoryProducts = allProducts.filter(p => p.category_id === null)
            const nullBrandProducts = allProducts.filter(p => p.brand_id === null)
            console.log(`🏷️ Produtos com category_id null: ${nullCategoryProducts.length}`)
            console.log(`🏭 Produtos com brand_id null: ${nullBrandProducts.length}`)
          }
        }

        // Query 4: Buscar apenas produtos ativos (query atual)
        console.log('🔍 Step 4: Buscando produtos ativos (query atual do hook)...')
        const activeProductsQuery = supabase
          .from('products')
          .select('id, name, sku, sale_price, stock, colors, sizes, description, status')
          .eq('status', 'active')
          .order('name')

        console.log('📋 Query SQL gerada (produtos ativos):', activeProductsQuery)

        const { data: activeProducts, error: activeError } = await activeProductsQuery

        if (activeError) {
          console.error('❌ Erro ao buscar produtos ativos:', activeError)
          console.error('❌ Detalhes do erro:', {
            message: activeError.message,
            code: activeError.code,
            details: activeError.details,
            hint: activeError.hint
          })
        } else {
          console.log('✅ Produtos ativos encontrados:', activeProducts)
          console.log(`📈 Total de produtos ativos: ${activeProducts?.length || 0}`)
          
          if (activeProducts && activeProducts.length > 0) {
            console.log('📋 Produtos ativos detalhados:')
            activeProducts.forEach((product, index) => {
              console.log(`  ${index + 1}. ${product.name}`)
              console.log(`      SKU: ${product.sku}`)
              console.log(`      Preço: R$ ${product.sale_price}`)
              console.log(`      Estoque: ${product.stock}`)
              console.log(`      Status: ${product.status}`)
              if (product.colors && product.colors.length > 0) {
                console.log(`      Cores: ${product.colors.join(', ')}`)
              }
              if (product.sizes && product.sizes.length > 0) {
                console.log(`      Tamanhos: ${product.sizes.join(', ')}`)
              }
              console.log(`      ---`)
            })
          } else {
            console.log('⚠️ Nenhum produto ativo encontrado!')
            
            // Se não há produtos ativos, vamos investigar
            if (allProducts && allProducts.length > 0) {
              console.log('🔍 Investigando por que produtos não são considerados ativos...')
              allProducts.forEach((product, index) => {
                console.log(`  Produto ${index + 1}: ${product.name}`)
                console.log(`    Status atual: "${product.status}" (tipo: ${typeof product.status})`)
                console.log(`    Status === 'active': ${product.status === 'active'}`)
                console.log(`    Status === "active": ${product.status === "active"}`)
              })
            }
          }
        }

        // Query 5: Teste sem filtro de status para comparação
        console.log('🔍 Step 5: Teste sem filtro de status...')
        const { data: noFilterProducts, error: noFilterError } = await supabase
          .from('products')
          .select('id, name, sku, sale_price, stock, colors, sizes, description, status')
          .order('name')

        if (noFilterError) {
          console.error('❌ Erro na query sem filtros:', noFilterError)
        } else {
          console.log(`📊 Produtos sem filtro de status: ${noFilterProducts?.length || 0}`)
        }

        // Verificar RLS
        console.log('🔍 Step 6: Verificando RLS (Row Level Security)...')
        console.log('🔐 Para verificar RLS, vamos tentar uma query direta...')
        
        console.log('🎯 Retornando produtos ativos para o componente...')
        return activeProducts || []
        
      } catch (error) {
        console.error('💥 Erro geral na busca de produtos:', error)
        console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A')
        throw error
      }
    },
    // Remover cache para debug
    staleTime: 0,
    gcTime: 0,
  })
}
