
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, Loader2, Bug } from 'lucide-react'
import { useProductsWithDetails, ProductWithDetails } from '@/hooks/useProductsWithDetails'
import { useCart } from '@/contexts/CartContext'
import { ProductSearch } from './ProductSearch'
import { ProductsTable } from './ProductsTable'
import { ProductsDebugPanel } from './ProductsDebugPanel'

export function ProductsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const { addToCart, getCartItemCount } = useCart()

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

  const handleAddToCart = (product: ProductWithDetails) => {
    addToCart({
      id: `${product.id}-${Date.now()}`,
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      sale_price: product.sale_price,
      stock: product.stock
    })
  }

  const cartItemCount = getCartItemCount()

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
      <div className="space-y-6">
        <div className="text-center text-red-500 p-8">
          <p className="text-lg font-semibold">Erro ao carregar produtos</p>
          <p className="text-sm mt-2">{error.message}</p>
          <Button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <Bug className="h-4 w-4 mr-2" />
            {showDebugPanel ? 'Ocultar' : 'Mostrar'} Diagnóstico
          </Button>
        </div>
        
        {showDebugPanel && (
          <div className="flex justify-center">
            <ProductsDebugPanel />
          </div>
        )}
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
          <div className="flex items-center space-x-4">
            {cartItemCount > 0 && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <ShoppingCart className="h-4 w-4" />
                <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}</span>
              </Badge>
            )}
            <Button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              variant="outline"
              size="sm"
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </Button>
          </div>
        </div>

        {showDebugPanel && (
          <div className="mb-6">
            <ProductsDebugPanel />
          </div>
        )}

        <ProductSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Produtos Disponíveis ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
          />
        </CardContent>
      </Card>
    </div>
  )
}
