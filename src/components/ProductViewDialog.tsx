
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

interface ProductViewDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductViewDialog({ product, open, onOpenChange }: ProductViewDialogProps) {
  if (!product) return null

  const getStockBadge = () => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (product.stock <= product.minStock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Estoque Baixo</Badge>
    } else {
      return <Badge variant="secondary">Em Estoque</Badge>
    }
  }

  const getStatusBadge = () => {
    return product.status === 'active' ? 
      <Badge variant="secondary">Ativo</Badge> : 
      <Badge variant="outline">Inativo</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateMargin = () => {
    if (!product.costPrice) return 'N/A'
    const margin = ((product.salePrice - product.costPrice) / product.salePrice) * 100
    return `${margin.toFixed(1)}%`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <div className="flex items-center space-x-2">
              {product.featured && <Badge className="bg-copper-500">Destaque</Badge>}
              {getStatusBadge()}
            </div>
          </DialogTitle>
          <DialogDescription>
            Visualização completa do produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium">{product.sku}</p>
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
                <p className="text-sm text-muted-foreground">Status do Estoque</p>
                {getStockBadge()}
              </div>
            </div>
          </div>

          <Separator />

          {/* Descrição */}
          {product.description && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Preços */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preços</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Preço de Venda</p>
                <p className="font-medium text-lg text-green-600">
                  R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {product.costPrice && (
                <div>
                  <p className="text-sm text-muted-foreground">Preço de Custo</p>
                  <p className="font-medium text-lg">
                    R$ {product.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                <p className="font-medium text-lg text-blue-600">{calculateMargin()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estoque */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Controle de Estoque</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantidade em Estoque</p>
                <p className="font-medium text-2xl">{product.stock} unidades</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                <p className="font-medium text-xl">{product.minStock} unidades</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Variações */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Variações do Produto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tamanhos Disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.length > 0 ? (
                    product.sizes.map((size, index) => (
                      <Badge key={index} variant="outline">{size}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum tamanho cadastrado</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Cores Disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.length > 0 ? (
                    product.colors.map((color, index) => (
                      <Badge key={index} variant="outline">{color}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhuma cor cadastrada</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações do Sistema */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informações do Sistema</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Data de Criação</p>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criado por</p>
                <p className="font-medium">{product.createdBy}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
