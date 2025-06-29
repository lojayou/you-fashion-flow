
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

  console.log('ProductSearch render:', { products: products.length, searchTerm, isLoading, error })

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (product.stock <= product.min_stock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Estoque Baixo</Badge>
    } else {
      return <Badge variant="secondary">Em Estoque</Badge>
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log('Input alterado para:', value)
    setSearchTerm(value)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Digite o SKU do produto..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p>Debug: produtos={products.length}, loading={isLoading.toString()}, error={error || 'nenhum'}</p>
          <p>Termo de busca: "{searchTerm}"</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-copper-500 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Buscando produtos por SKU...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-destructive font-medium">Erro na busca</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Products List */}
      {!isLoading && !error && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? `Nenhum produto encontrado com SKU "${searchTerm}"` : 'Nenhum produto disponível'}
              </p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Verifique se o SKU está correto ou tente uma busca parcial
                </p>
              )}
            </div>
          ) : (
            <>
              {searchTerm && (
                <p className="text-sm text-muted-foreground">
                  {products.length} produto(s) encontrado(s) para SKU "{searchTerm}"
                </p>
              )}
              {products.map((product) => (
                <Card key={product.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">SKU:</span> {product.sku}
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
                            onClick={() => {
                              console.log('Produto selecionado:', product)
                              onProductSelect(product)
                            }}
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
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
