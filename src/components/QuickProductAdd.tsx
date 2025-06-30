
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Loader2 } from 'lucide-react'
import { useProductsWithDetails, ProductWithDetails } from '@/hooks/useProductsWithDetails'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'

export function QuickProductAdd() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null)
  const { data: products = [], isLoading } = useProductsWithDetails()
  const { addToCart } = useCart()
  const { toast } = useToast()

  // Filter products based on search term
  const filteredProducts = searchTerm 
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5) // Show only top 5 results when searching
    : products.slice(0, 10) // Show first 10 products when not searching

  const handleAddToCart = (product: ProductWithDetails) => {
    addToCart({
      id: `${product.id}-${Date.now()}`,
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      sale_price: product.sale_price,
      stock: product.stock
    })
    
    setSearchTerm('')
    setSelectedProduct(null)
    
    toast({
      title: 'Produto adicionado',
      description: `${product.name} foi adicionado ao carrinho`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Adicionar Produto</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? `Resultados da busca (${filteredProducts.length})`
                  : `Produtos disponíveis (${products.length})`
                }
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-xs"
                >
                  Limpar busca
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sku} • R$ {product.sale_price.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {product.category && (
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        )}
                        <Badge 
                          variant={product.stock > 0 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          Estoque: {product.stock}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="bg-copper-500 hover:bg-copper-600"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
