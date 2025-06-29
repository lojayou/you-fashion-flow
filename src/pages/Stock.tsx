import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TimeFilter } from '@/components/TimeFilter'
import { ProductViewDialog } from '@/components/ProductViewDialog'
import { ProductEditDialog } from '@/components/ProductEditDialog'
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
  category: string
  brand: string
  description: string
  salePrice: number
  costPrice?: number
  stock: number
  minStock: number
  sizes: string[]
  colors: string[]
  status: 'active' | 'inactive'
  featured: boolean
  createdAt: string
  createdBy: string
}

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null)
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Blusa Elegante Social',
      sku: 'BLS001',
      category: 'Blusas',
      brand: 'Fashion Style',
      description: 'Blusa social elegante para uso profissional',
      salePrice: 89.90,
      costPrice: 45.00,
      stock: 3,
      minStock: 5,
      sizes: ['P', 'M', 'G'],
      colors: ['Branco', 'Azul', 'Preto'],
      status: 'active',
      featured: true,
      createdAt: '2025-06-01T10:00:00',
      createdBy: 'Admin'
    },
    {
      id: '2',
      name: 'Calça Jeans Skinny',
      sku: 'CJN002',
      category: 'Calças',
      brand: 'Denim Co',
      description: 'Calça jeans modelo skinny, corte moderno',
      salePrice: 129.90,
      costPrice: 65.00,
      stock: 8,
      minStock: 5,
      sizes: ['36', '38', '40', '42'],
      colors: ['Azul', 'Preto'],
      status: 'active',
      featured: false,
      createdAt: '2025-06-02T14:30:00',
      createdBy: 'Admin'
    },
    {
      id: '3',
      name: 'Vestido Festa Longo',
      sku: 'VFL003',
      category: 'Vestidos',
      brand: 'Elegance',
      description: 'Vestido longo para festas e eventos especiais',
      salePrice: 199.90,
      costPrice: 95.00,
      stock: 2,
      minStock: 3,
      sizes: ['P', 'M', 'G'],
      colors: ['Vermelho', 'Azul Marinho', 'Preto'],
      status: 'active',
      featured: true,
      createdAt: '2025-06-03T16:15:00',
      createdBy: 'Admin'
    },
    {
      id: '4',
      name: 'Saia Midi Plissada',
      sku: 'SMP004',
      category: 'Saias',
      brand: 'Fashion Style',
      description: 'Saia midi com pregas, versatil para várias ocasiões',
      salePrice: 79.90,
      costPrice: 38.00,
      stock: 12,
      minStock: 5,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Bege', 'Preto', 'Marinho'],
      status: 'active',
      featured: false,
      createdAt: '2025-06-04T09:20:00',
      createdBy: 'Admin'
    },
    {
      id: '5',
      name: 'Blazer Executivo',
      sku: 'BLZ005',
      category: 'Blazers',
      brand: 'Executive',
      description: 'Blazer executivo para look profissional',
      salePrice: 159.90,
      costPrice: 78.00,
      stock: 0,
      minStock: 3,
      sizes: ['P', 'M', 'G'],
      colors: ['Preto', 'Cinza'],
      status: 'inactive',
      featured: false,
      createdAt: '2025-06-05T11:45:00',
      createdBy: 'Admin'
    }
  ]

  const categories = ['Blusas', 'Calças', 'Vestidos', 'Saias', 'Blazers']

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handlePeriodChange = (period: string, customDates?: { from: Date; to: Date }) => {
    console.log('Period changed to:', period, customDates)
    // Aqui você implementaria a lógica para filtrar movimentações de estoque baseado no período
  }

  const lowStockProducts = mockProducts.filter(product => product.stock <= product.minStock && product.stock > 0)
  const outOfStockProducts = mockProducts.filter(product => product.stock === 0)
  const featuredProducts = mockProducts.filter(product => product.featured)

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
    setRefreshKey(prev => prev + 1)
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
          <Button className="bg-copper-500 hover:bg-copper-600">
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
                <p className="text-2xl font-bold">{mockProducts.length}</p>
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
                placeholder="Buscar produto, SKU ou marca..."
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

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos ({filteredProducts.length})</CardTitle>
          <CardDescription>Inventário de produtos da loja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum produto encontrado com os filtros aplicados
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{product.name}</p>
                        {product.featured && <Star className="h-4 w-4 text-copper-500 fill-current" />}
                      </div>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Marca</p>
                      <p className="font-medium">{product.brand}</p>
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
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(product.status)}
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
          </div>
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
    </div>
  )
}
