
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
        // Busca por nome ou SKU com correspondência parcial
        query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
        console.log('Aplicando filtro de busca:', `name.ilike.%${term}%,sku.ilike.%${term}%`)
      }

      const { data, error } = await query
        .order('name')
        .limit(50)

      if (error) {
        console.error('Erro na consulta da tabela products:', error)
        throw error
      }

      console.log(`Encontrados ${data?.length || 0} produtos na tabela:`, data)

      if (!data || data.length === 0) {
        console.log('Nenhum produto encontrado na tabela products')
        setProducts([])
        return
      }

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sale_price: product.sale_price || 0,
        stock: product.stock || 0,
        min_stock: product.min_stock || 0,
        status: product.status as 'active' | 'inactive',
        brand: undefined, // Será implementado posteriormente
        category: undefined // Será implementado posteriormente
      }))

      console.log('Produtos formatados para exibição:', formattedProducts)
      setProducts(formattedProducts)
    } catch (err) {
      console.error('Erro ao buscar produtos na tabela products:', err)
      setError('Erro ao buscar produtos')
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
