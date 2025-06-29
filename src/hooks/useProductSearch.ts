
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
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          sale_price,
          stock,
          min_stock,
          status
        `)

      // Se há termo de busca, aplicar filtro por nome OU SKU
      if (term.trim()) {
        query = query.or(`name.ilike.%${term.trim()}%,sku.ilike.%${term.trim()}%`)
      }

      // Sempre buscar apenas produtos ativos
      query = query.eq('status', 'active')

      const { data, error } = await query
        .order('name')
        .limit(50)

      if (error) {
        throw new Error(`Erro na consulta: ${error.message}`)
      }

      if (!data) {
        setProducts([])
        return
      }

      // Formatação dos produtos
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name || 'Nome não informado',
        sku: product.sku || 'SKU não informado',
        sale_price: Number(product.sale_price) || 0,
        stock: Number(product.stock) || 0,
        min_stock: Number(product.min_stock) || 0,
        status: product.status as 'active' | 'inactive'
      }))

      setProducts(formattedProducts)
      
    } catch (err: any) {
      const errorMessage = err.message || err.toString() || 'Erro desconhecido na busca'
      setError(errorMessage)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce para busca automática
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchTerm)
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Carregar produtos iniciais ao montar o componente
  useEffect(() => {
    searchProducts('')
  }, [])

  return {
    products,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    manualSearch: searchProducts
  }
}
