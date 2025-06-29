
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
      console.log('=== INICIANDO BUSCA POR SKU ===')
      console.log('Termo de busca:', term)
      console.log('Termo após trim:', term.trim())
      
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
        .eq('status', 'active')

      if (term.trim()) {
        console.log('Aplicando filtro por SKU com termo:', term)
        query = query.ilike('sku', `%${term}%`)
      } else {
        console.log('Carregando todos os produtos ativos (sem filtro)')
      }

      console.log('Executando query...')
      const { data, error } = await query
        .order('name')
        .limit(50)

      console.log('Resposta da query:', { data, error })

      if (error) {
        console.error('Erro na consulta Supabase:', error)
        throw error
      }

      console.log('Dados retornados:', {
        total: data?.length || 0,
        produtos: data?.map(p => ({ sku: p.sku, name: p.name }))
      })

      if (!data) {
        console.log('Nenhum dado retornado (data é null/undefined)')
        setProducts([])
        return
      }

      if (data.length === 0) {
        console.log('Array de dados está vazio')
        setProducts([])
        return
      }

      // Formatação dos produtos com validação
      const formattedProducts = data.map(product => {
        console.log('Formatando produto:', product)
        return {
          id: product.id,
          name: product.name || 'Nome não informado',
          sku: product.sku || 'SKU não informado',
          sale_price: Number(product.sale_price) || 0,
          stock: Number(product.stock) || 0,
          min_stock: Number(product.min_stock) || 0,
          status: product.status as 'active' | 'inactive',
          brand: undefined,
          category: undefined
        }
      })

      console.log('Produtos formatados:', formattedProducts)
      console.log('=== BUSCA CONCLUÍDA COM SUCESSO ===')
      
      setProducts(formattedProducts)
    } catch (err: any) {
      console.error('=== ERRO NA BUSCA ===')
      console.error('Erro completo:', err)
      console.error('Mensagem do erro:', err.message)
      console.error('Stack trace:', err.stack)
      
      setError(`Erro ao buscar produtos: ${err.message || 'Erro desconhecido'}`)
      setProducts([])
    } finally {
      setIsLoading(false)
      console.log('=== FINALIZANDO BUSCA ===')
    }
  }

  useEffect(() => {
    console.log('useEffect disparado com searchTerm:', searchTerm)
    const timeoutId = setTimeout(() => {
      console.log('Executando busca após debounce de 300ms')
      searchProducts(searchTerm)
    }, 300)

    return () => {
      console.log('Limpando timeout do debounce')
      clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Carregar produtos iniciais
  useEffect(() => {
    console.log('Carregando produtos iniciais')
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
