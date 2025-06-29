
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
      console.log('URL Supabase:', supabase.supabaseUrl)
      
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

      // Se há termo de busca, aplicar filtro por SKU
      if (term.trim()) {
        console.log('Aplicando filtro SKU:', term.trim())
        query = query.ilike('sku', `%${term.trim()}%`)
      }

      // Sempre buscar apenas produtos ativos
      query = query.eq('status', 'active')

      console.log('Executando query Supabase...')
      const { data, error, status, statusText } = await query
        .order('name')
        .limit(50)

      console.log('Resposta completa:', { data, error, status, statusText })

      if (error) {
        console.error('ERRO SUPABASE:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Erro na consulta: ${error.message}`)
      }

      if (!data) {
        console.log('Dados nulos retornados')
        setProducts([])
        return
      }

      console.log(`${data.length} produto(s) encontrado(s):`)
      data.forEach(product => {
        console.log(`- SKU: ${product.sku}, Nome: ${product.name}, Status: ${product.status}`)
      })

      // Formatação simples dos produtos
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name || 'Nome não informado',
        sku: product.sku || 'SKU não informado',
        sale_price: Number(product.sale_price) || 0,
        stock: Number(product.stock) || 0,
        min_stock: Number(product.min_stock) || 0,
        status: product.status as 'active' | 'inactive'
      }))

      console.log('Produtos formatados para estado:', formattedProducts)
      setProducts(formattedProducts)
      console.log('=== BUSCA CONCLUÍDA COM SUCESSO ===')
      
    } catch (err: any) {
      console.error('=== ERRO NA BUSCA ===')
      console.error('Erro completo:', err)
      console.error('Tipo do erro:', typeof err)
      console.error('Stack trace:', err.stack)
      
      const errorMessage = err.message || err.toString() || 'Erro desconhecido na busca'
      setError(errorMessage)
      setProducts([])
      
      // Log adicional para debug
      console.error('Estado após erro:', {
        error: errorMessage,
        productsLength: 0,
        isLoading: false
      })
    } finally {
      setIsLoading(false)
      console.log('=== FINALIZANDO BUSCA ===')
    }
  }

  // Debounce para busca automática
  useEffect(() => {
    console.log('useEffect disparado - searchTerm:', searchTerm)
    
    const timeoutId = setTimeout(() => {
      console.log('Executando busca após debounce')
      searchProducts(searchTerm)
    }, 300)

    return () => {
      console.log('Limpando timeout do debounce')
      clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Carregar produtos iniciais ao montar o componente
  useEffect(() => {
    console.log('Hook montado - carregando produtos iniciais')
    searchProducts('')
  }, [])

  return {
    products,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    // Função auxiliar para busca manual
    manualSearch: searchProducts
  }
}
