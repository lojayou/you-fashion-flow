
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
      console.log('🔍 Iniciando busca de produtos - Nova estrutura implementada')
      
      try {
        // 1. Testar conectividade básica com Supabase
        console.log('🔌 Testando conectividade com Supabase...')
        const { data: testConnection } = await supabase
          .from('products')
          .select('count')
          .limit(1)
        
        console.log('✅ Conectividade OK:', testConnection !== null)

        // 2. Verificar se o usuário está autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('👤 Status de autenticação:', {
          authenticated: !!user,
          userId: user?.id || 'N/A',
          error: authError?.message || 'N/A'
        })

        // 3. Executar query principal com nova estrutura
        console.log('📋 Executando query principal...')
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

        console.log('📊 Resultado da query:', {
          sucesso: !error,
          totalProdutos: products?.length || 0,
          erro: error?.message || 'N/A'
        })

        if (error) {
          console.error('❌ Erro detalhado na query:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })

          // Verificar se é erro de RLS
          if (error.code === 'PGRST116' || error.message.includes('RLS')) {
            console.log('🔐 Erro de RLS detectado - Tentando query de diagnóstico...')
            
            // Tentar query mais simples para diagnóstico
            const { data: simpleTest, error: simpleError } = await supabase
              .from('products')
              .select('id, name')
              .limit(1)

            if (simpleError) {
              console.error('❌ Erro na query simples também:', simpleError)
            } else {
              console.log('✅ Query simples funcionou:', simpleTest?.length || 0)
            }
          }
          
          throw error
        }

        // 4. Processar e analisar os dados retornados
        if (products && products.length > 0) {
          console.log('📋 Produtos encontrados:')
          products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (${product.sku})`)
            console.log(`   Categoria: ${product.category || 'Não definida'}`)
            console.log(`   Marca: ${product.brand || 'Não definida'}`)
            console.log(`   Estoque: ${product.stock}`)
            console.log(`   Status: ${product.status}`)
          })

          // Estatísticas
          const stats = {
            total: products.length,
            comEstoque: products.filter(p => p.stock > 0).length,
            semEstoque: products.filter(p => p.stock === 0).length,
            comCategoria: products.filter(p => p.category).length,
            comMarca: products.filter(p => p.brand).length
          }

          console.log('📊 Estatísticas dos produtos:', stats)
        } else {
          console.log('⚠️ Nenhum produto ativo encontrado')
          
          // Diagnóstico adicional
          console.log('🔍 Executando diagnóstico adicional...')
          
          const { data: allProducts, error: allError } = await supabase
            .from('products')
            .select('id, name, status')
            .limit(10)

          if (allError) {
            console.error('❌ Erro no diagnóstico:', allError)
          } else {
            console.log('📋 Todos os produtos encontrados:', allProducts?.length || 0)
            if (allProducts && allProducts.length > 0) {
              console.log('Status dos produtos:')
              allProducts.forEach(p => {
                console.log(`- ${p.name}: ${p.status}`)
              })
            }
          }
        }

        return products || []
        
      } catch (error) {
        console.error('💥 Erro geral na busca de produtos:', error)
        if (error instanceof Error) {
          console.error('💥 Stack trace:', error.stack)
        }
        throw error
      }
    },
    // Configurações de cache otimizadas para debug
    staleTime: 0, // Sempre buscar dados frescos durante debug
    gcTime: 30000, // 30 segundos
    retry: (failureCount, error) => {
      console.log(`🔄 Tentativa ${failureCount + 1} falhou:`, error)
      return failureCount < 2 // Tentar até 3 vezes
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
