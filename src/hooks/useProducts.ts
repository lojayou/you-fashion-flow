
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
      console.log('Buscando produtos do banco de dados...')
      
      // Primeiro, vamos buscar todos os produtos para debug
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, sku, sale_price, stock, colors, sizes, description, status')

      if (allError) {
        console.error('Erro ao buscar todos os produtos:', allError)
      } else {
        console.log('Todos os produtos no banco:', allProducts)
        console.log('Total de produtos:', allProducts?.length || 0)
      }

      // Agora buscar apenas os produtos ativos
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, sale_price, stock, colors, sizes, description, status')
        .eq('status', 'active')
        .order('name')

      if (error) {
        console.error('Erro ao buscar produtos ativos:', error)
        throw error
      }

      console.log('Produtos ativos encontrados:', data)
      console.log('Produtos com estoque > 0:', data?.filter(p => p.stock > 0))
      
      // Retornar todos os produtos ativos, independente do estoque para debug
      return data || []
    },
  })
}
