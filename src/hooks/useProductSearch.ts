
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
      console.log('Iniciando busca com termo:', term)
      
      // Primeiro, vamos testar uma consulta simples sem relacionamentos
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (term.trim()) {
        // Busca mais flexível usando ilike para busca parcial case-insensitive
        query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
      }

      const { data: simpleData, error: simpleError } = await query.limit(20)

      if (simpleError) {
        console.error('Erro na consulta simples:', simpleError)
        throw simpleError
      }

      console.log('Dados retornados da consulta simples:', simpleData)

      // Agora vamos buscar os relacionamentos separadamente se precisarmos
      const formattedProducts = simpleData?.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sale_price: product.sale_price,
        stock: product.stock || 0,
        min_stock: product.min_stock || 0,
        status: product.status,
        brand: undefined, // Por enquanto sem relacionamento
        category: undefined // Por enquanto sem relacionamento
      })) || []

      console.log('Produtos formatados:', formattedProducts)
      setProducts(formattedProducts)
    } catch (err) {
      console.error('Error searching products:', err)
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
