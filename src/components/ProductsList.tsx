
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ShoppingCart, Search, Package, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useProductsWithDetails } from '@/hooks/useProductsWithDetails'

interface ProductsListProps {
  onAddToCart: (productId: string, productName: string, price: number, stock: number) => void
  cartItemCount?: number
}

export function ProductsList({ onAddToCart, cartItemCount = 0 }: ProductsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { toast } = useToast()

  const { data: products = [], isLoading, error } = useProductsWithDetails()

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
    return uniqueCategories.sort()
  }, [products])

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === '' || product.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  const handleAddToCart = (product: any) => {
    onAddToCart(product.id, product.name, product.sale_price, product.stock)
    toast({
      title: 'Produto adicionado',
      description: `${product.name} foi adicionado ao carrinho`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produtos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Erro ao carregar produtos</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lista de Produtos</h1>
            <p className="text-muted-foreground">Selecione produtos para adicionar ao carrinho</p>
          </div>
          {cartItemCount > 0 && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <ShoppingCart className="h-4 w-4" />
              <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}</span>
            </Badge>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Produtos Disponíveis ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
              {searchTerm || categoryFilter ? (
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {product.description}
                            </p>
                          )}
                          {(product.colors.length > 0 || product.sizes.length > 0) && (
                            <div className="flex gap-1 mt-1">
                              {product.colors.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {product.colors.length} cor{product.colors.length > 1 ? 'es' : ''}
                                </Badge>
                              )}
                              {product.sizes.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {product.sizes.length} tam{product.sizes.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.category || '—'}</TableCell>
                      <TableCell>{product.brand || '—'}</TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {product.sale_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={product.stock > 0 ? 'secondary' : 'destructive'}
                          className="font-mono"
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                className="bg-copper-500 hover:bg-copper-600 disabled:opacity-50"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {product.stock === 0 
                                ? 'Produto sem estoque' 
                                : `Estoque disponível: ${product.stock}`
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
