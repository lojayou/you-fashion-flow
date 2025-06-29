
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
      console.log('Iniciando busca de produtos por SKU:', term)
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          sale_price,
          stock,
          min_stock,
          status,
          brand_id,
          category_id
        `)
        .eq('status', 'active')

      if (term.trim()) {
        // Busca exclusiva por SKU
        query = query.ilike('sku', `%${term}%`)
        console.log('Filtro aplicado - buscando por SKU:', term)
      } else {
        console.log('Carregando todos os produtos ativos')
      }

      const { data, error } = await query
        .order('name')
        .limit(50)

      if (error) {
        console.error('Erro na consulta Supabase:', error)
        throw error
      }

      console.log('Resultado da consulta:', {
        total: data?.length || 0,
        dados: data
      })

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
      console.error('Erro completo na busca:', err)
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
