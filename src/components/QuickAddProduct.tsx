
import { useState } from 'react'
import { Search, Plus, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface Product {
  id: string
  name: string
  sku: string
  sale_price: number
  stock: number
  min_stock: number
  status: 'active' | 'inactive'
}

interface QuickAddProductProps {
  onProductAdd: (product: Product) => void
}

export function QuickAddProduct({ onProductAdd }: QuickAddProductProps) {
  const [sku, setSku] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!sku.trim()) {
      toast({
        title: 'SKU obrigatório',
        description: 'Digite o SKU do produto',
        variant: 'destructive'
      })
      return
    }

    setIsSearching(true)
    
    try {
      console.log('Buscando produto por SKU:', sku.trim())
      
      const { data, error } = await supabase
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
        .eq('sku', sku.trim())
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        console.error('Erro na busca:', error)
        throw new Error(`Erro na consulta: ${error.message}`)
      }

      if (!data) {
        toast({
          title: 'Produto não encontrado',
          description: `Nenhum produto ativo encontrado com SKU: ${sku}`,
          variant: 'destructive'
        })
        return
      }

      if (data.stock === 0) {
        toast({
          title: 'Produto sem estoque',
          description: `${data.name} está sem estoque`,
          variant: 'destructive'
        })
        return
      }

      console.log('Produto encontrado:', data)
      onProductAdd(data)
      setSku('')
      
      toast({
        title: 'Produto adicionado',
        description: `${data.name} foi adicionado ao carrinho`,
      })

    } catch (err: any) {
      console.error('Erro na busca:', err)
      toast({
        title: 'Erro na busca',
        description: err.message || 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Digite o SKU (ex: BLS001)"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
          disabled={isSearching}
        />
      </div>
      <Button
        onClick={handleSearch}
        disabled={isSearching || !sku.trim()}
        className="bg-copper-500 hover:bg-copper-600"
      >
        {isSearching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
