
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
      console.log('🔍 Buscando produtos ativos - Hook atualizado para nova estrutura...')
      
      try {
        // 1. Verificar autenticação atual
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('👤 Usuário autenticado:', user?.id || 'Não autenticado')
        if (authError) {
          console.error('❌ Erro de autenticação:', authError)
        }

        // 2. Buscar produtos usando campos diretos de categoria e marca
        console.log('📋 Executando query com campos diretos...')
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

        console.log('📊 Query executada:')
        console.log('  - Filtro: status = "active"')
        console.log('  - Sem filtro de stock (permite estoque 0)')
        console.log('  - Campos diretos: category, brand (sem relacionamento)')
        console.log('  - Ordenação: por nome')

        if (error) {
          console.error('❌ Erro na query:', error)
          console.error('❌ Detalhes do erro:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          
          // Verificar se é problema de RLS
          if (error.code === 'PGRST116' || error.message.includes('RLS')) {
            console.log('🔐 Possível problema de RLS detectado')
            console.log('💡 Sugestão: Verificar se a policy SELECT permite acesso aos produtos')
          }
          
          throw error
        }

        console.log('✅ Produtos encontrados:', products?.length || 0)
        
        if (products && products.length > 0) {
          console.log('📋 Lista de produtos:')
          products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name}`)
            console.log(`      ID: ${product.id}`)
            console.log(`      SKU: ${product.sku}`)
            console.log(`      Status: ${product.status}`)
            console.log(`      Estoque: ${product.stock}`)
            console.log(`      Preço: R$ ${product.sale_price}`)
            console.log(`      Categoria: ${product.category || 'Não definida'}`)
            console.log(`      Marca: ${product.brand || 'Não definida'}`)
            console.log(`      ---`)
          })

          // Análise dos dados
          const withStock = products.filter(p => p.stock > 0)
          const withoutStock = products.filter(p => p.stock === 0)
          const withCategory = products.filter(p => p.category)
          const withoutCategory = products.filter(p => !p.category)
          const withBrand = products.filter(p => p.brand)
          const withoutBrand = products.filter(p => !p.brand)

          console.log('📊 Análise dos produtos encontrados:')
          console.log(`  - Com estoque > 0: ${withStock.length}`)
          console.log(`  - Com estoque = 0: ${withoutStock.length}`)
          console.log(`  - Com categoria: ${withCategory.length}`)
          console.log(`  - Sem categoria: ${withoutCategory.length}`)
          console.log(`  - Com marca: ${withBrand.length}`)
          console.log(`  - Sem marca: ${withoutBrand.length}`)
        } else {
          console.log('⚠️ Nenhum produto ativo encontrado!')
          
          // Testar query mais simples para diagnóstico
          console.log('🔍 Testando query sem filtros para diagnóstico...')
          const { data: allProducts, error: allError } = await supabase
            .from('products')
            .select('id, name, status')
            .limit(5)

          if (allError) {
            console.error('❌ Erro na query de diagnóstico:', allError)
            console.log('🔐 Possível problema de RLS ou permissões')
          } else {
            console.log('📋 Produtos encontrados na query de diagnóstico:', allProducts?.length || 0)
            if (allProducts && allProducts.length > 0) {
              console.log('📊 Status dos produtos na base:')
              allProducts.forEach(p => {
                console.log(`  - ${p.name}: status = "${p.status}"`)
              })
            } else {
              console.log('📭 Tabela products está vazia ou RLS está bloqueando acesso')
            }
          }
        }

        return products || []
        
      } catch (error) {
        console.error('💥 Erro geral na busca de produtos:', error)
        console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A')
        throw error
      }
    },
    // Cache configurado para debug
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
    retry: 1
  })
}
