
import { Search, Package, AlertTriangle, RefreshCw } from 'lucide-react'
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
  const { products, searchTerm, setSearchTerm, isLoading, error, manualSearch } = useProductSearch()

  console.log('ProductSearch render - Estado atual:', {
    productsCount: products.length,
    searchTerm,
    isLoading,
    hasError: !!error,
    errorMessage: error
  })

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

  const handleManualRefresh = () => {
    console.log('Refresh manual solicitado')
    manualSearch(searchTerm)
  }

  return (
    <div className="space-y-4">
      {/* Search Input with Manual Refresh */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Digite o SKU do produto (ex: BLS001)..."
            value={searchTerm}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleManualRefresh}
          disabled={isLoading}
          title="Atualizar busca"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded border">
          <p><strong>Debug:</strong></p>
          <p>• Produtos encontrados: {products.length}</p>
          <p>• Carregando: {isLoading ? 'Sim' : 'Não'}</p>
          <p>• Erro: {error || 'Nenhum'}</p>
          <p>• Termo de busca: "{searchTerm}"</p>
          <p>• Página atual: {window.location.pathname}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper-500 mx-auto mb-3"></div>
          <p className="text-muted-foreground font-medium">Buscando produtos...</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? `Procurando por SKU: "${searchTerm}"` : 'Carregando produtos ativos'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-6 space-y-3">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <p className="text-destructive font-medium text-lg">Erro na busca de produtos</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Products List */}
      {!isLoading && !error && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Package className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  {searchTerm ? `Nenhum produto encontrado` : 'Nenhum produto disponível'}
                </p>
                {searchTerm ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      SKU pesquisado: "{searchTerm}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dica: Tente SKUs como "BLS001", "CJN002", "VFL003"
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há produtos ativos cadastrados
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="bg-muted/50 p-3 rounded-lg border">
                  <p className="text-sm font-medium">
                    {products.length} produto(s) encontrado(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Busca por SKU: "{searchTerm}"
                  </p>
                </div>
              )}
              
              {products.map((product) => (
                <Card key={product.id} className="hover:bg-muted/50 transition-colors border-l-4 border-l-copper-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg">{product.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                SKU: {product.sku}
                              </Badge>
                              {getStockBadge(product)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              R$ {product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Estoque: {product.stock} unidade(s)
                            </p>
                          </div>
                          
                          <Button
                            size="lg"
                            onClick={() => {
                              console.log('Produto selecionado:', product)
                              onProductSelect(product)
                            }}
                            disabled={product.stock === 0}
                            className="bg-copper-500 hover:bg-copper-600 text-white px-6"
                          >
                            {product.stock === 0 ? (
                              <>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Sem Estoque
                              </>
                            ) : (
                              <>
                                <Package className="h-4 w-4 mr-2" />
                                Adicionar
                              </>
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
