
import { Search, Package, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useProductSearch } from '@/hooks/useProductSearch'

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

interface ProductSearchProps {
  onProductSelect: (product: Product) => void
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const { products, searchTerm, setSearchTerm, isLoading, error } = useProductSearch()

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (product.stock <= product.min_stock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Estoque Baixo</Badge>
    } else {
      return <Badge variant="secondary">Em Estoque</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, SKU ou marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Buscando produtos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Products List */}
      {!isLoading && !error && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
              </p>
            </div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                            {product.brand && ` • ${product.brand.name}`}
                            {product.category && ` • ${product.category.name}`}
                          </p>
                        </div>
                        {getStockBadge(product)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-green-600">
                            R$ {product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Estoque: {product.stock} unidades
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => onProductSelect(product)}
                          disabled={product.stock === 0}
                          className="bg-copper-500 hover:bg-copper-600"
                        >
                          {product.stock === 0 ? (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Sem Estoque
                            </>
                          ) : (
                            'Adicionar'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
