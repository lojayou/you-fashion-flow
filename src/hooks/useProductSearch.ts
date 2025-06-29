
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface Product {
  id: string
  name: string
  sku: string
  sale_price: number
  stock: number
  min_stock: number
  status: 'active' | 'inactive'
  brand?: {
    name: string
  }
  category?: {
    name: string
  }
}

export function useProductSearch() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = async (term: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Buscando produtos na tabela "products" com termo:', term)
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')

      if (term.trim()) {
        // Corrigindo a sintaxe da busca - usando filtros separados
        query = query
          .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
        console.log('Aplicando filtro de busca para:', term)
      }

      const { data, error } = await query
        .order('name')
        .limit(50)

      if (error) {
        console.error('Erro na consulta Supabase:', error)
        throw error
      }

      console.log(`Produtos encontrados: ${data?.length || 0}`)
      console.log('Dados retornados:', data)

      if (!data || data.length === 0) {
        console.log('Nenhum produto encontrado')
        setProducts([])
        return
      }

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sale_price: Number(product.sale_price) || 0,
        stock: Number(product.stock) || 0,
        min_stock: Number(product.min_stock) || 0,
        status: product.status as 'active' | 'inactive',
        brand: undefined,
        category: undefined
      }))

      console.log('Produtos formatados:', formattedProducts)
      setProducts(formattedProducts)
    } catch (err: any) {
      console.error('Erro detalhado na busca:', err)
      setError(`Erro ao buscar produtos: ${err.message || 'Erro desconhecido'}`)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchTerm)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Carregar produtos iniciais
  useEffect(() => {
    searchProducts('')
  }, [])

  return {
    products,
    searchTerm,
    setSearchTerm,
    isLoading,
    error
  }
}
