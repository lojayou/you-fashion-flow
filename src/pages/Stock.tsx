import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimeFilter } from '@/components/TimeFilter'
import { ProductViewDialog } from '@/components/ProductViewDialog'
import { ProductEditDialog } from '@/components/ProductEditDialog'
import { ProductCreateDialog } from '@/components/ProductCreateDialog'
import { InfiniteScrollContainer } from '@/components/InfiniteScrollContainer'
import { useProductsWithDetails } from '@/hooks/useProductsWithDetails'
import { 
  Search, 
  Filter, 
  Package, 
  Plus,
  Edit,
  AlertTriangle,
  Eye,
  Star,
  TrendingDown
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  product_code: string | null
  category: string
  brand: string
  description: string
  salePrice: number
  costPrice?: number
  stock: number
  minStock: number
  size: string
  color: string
  status: 'active' | 'inactive'
  featured: boolean
  createdAt: string
  createdBy: string
  sizes: string[]
  colors: string[]
}

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null)
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(20)

  const { data: products = [], refetch } = useProductsWithDetails()

  const handlePeriodChange = (period: string, customDates?: { from: Date; to: Date }) => {
    console.log('Period changed to:', period, customDates)
  }

  // Convert products to the expected format for compatibility
  const convertedProducts: Product[] = products.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    product_code: product.product_code,
    category: product.category || '',
    brand: product.brand || '',
    description: product.description || '',
    salePrice: product.sale_price,
    costPrice: 0,
    stock: product.stock,
    minStock: 5,
    size: product.size || '',
    color: product.color || '',
    status: 'active' as const,
    featured: false,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin',
    sizes: product.size ? [product.size] : [],
    colors: product.color ? [product.color] : []
  }))

  const categories = [...new Set(products.filter(p => p.category).map(p => p.category!))]

  const filteredProducts = convertedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.product_code && product.product_code.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const displayedProducts = filteredProducts.slice(0, displayLimit)
  const hasMore = displayLimit < filteredProducts.length

  const loadMore = () => {
    setDisplayLimit(prev => prev + 20)
  }

  const lowStockProducts = convertedProducts.filter(product => product.stock <= product.minStock && product.stock > 0)
  const outOfStockProducts = convertedProducts.filter(product => product.stock === 0)
  const featuredProducts = convertedProducts.filter(product => product.featured)

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (product.stock <= product.minStock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Estoque Baixo</Badge>
    } else {
      return <Badge variant="secondary">Em Estoque</Badge>
    }
  }

  const getStatusBadge = (status: Product['status']) => {
    return status === 'active' ? 
      <Badge variant="secondary">Ativo</Badge> : 
      <Badge variant="outline">Inativo</Badge>
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProductForView(product)
    setIsViewDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProductForEdit(product)
    setIsEditDialogOpen(true)
  }

  const handleProductUpdated = () => {
    refetch()
  }

  const handleProductCreated = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
          <p className="text-muted-foreground">Gestão de produtos e inventário</p>
        </div>
        <div className="flex items-center space-x-4">
          <TimeFilter onPeriodChange={handlePeriodChange} />
          <Button 
            className="bg-copper-500 hover:bg-copper-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{convertedProducts.length}</p>
              </div>
              <Package className="h-8 w-8 text-copper-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sem Estoque</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtos Destaque</p>
                <p className="text-2xl font-bold text-copper-600">{featuredProducts.length}</p>
              </div>
              <Star className="h-8 w-8 text-copper-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto, SKU, marca ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products List with Infinite Scroll */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos ({filteredProducts.length})</CardTitle>
          <CardDescription>Inventário de produtos da loja</CardDescription>
        </CardHeader>
        <CardContent>
          <InfiniteScrollContainer
            hasMore={hasMore}
            loadMore={loadMore}
            className="space-y-4"
          >
            {displayedProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum produto encontrado com os filtros aplicados
              </p>
            ) : (
              displayedProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-8 gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{product.name}</p>
                        {product.featured && <Star className="h-4 w-4 text-copper-500 fill-current" />}
                      </div>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      {product.product_code && (
                        <p className="text-sm text-muted-foreground">Código: {product.product_code}</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <p className="font-medium">{product.category || '—'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Marca</p>
                      <p className="font-medium">{product.brand || '—'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Tamanho</p>
                      <p className="font-medium">{product.size || '—'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Cor</p>
                      <p className="font-medium">{product.color || '—'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Preço</p>
                      <p className="font-medium">
                        R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Estoque</p>
                      <p className="font-medium">{product.stock} unidades</p>
                      {getStockBadge(product)}
                      <div className="mt-1">
                        {getStatusBadge(product.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewProduct(product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </InfiniteScrollContainer>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductViewDialog
        product={selectedProductForView}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      <ProductEditDialog
        product={selectedProductForEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProductUpdated={handleProductUpdated}
      />

      <ProductCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProductCreated={handleProductCreated}
      />
    </div>
  )
}
