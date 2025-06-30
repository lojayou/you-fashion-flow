
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package } from 'lucide-react'
import { ProductWithDetails } from '@/hooks/useProductsWithDetails'
import { ProductTableRow } from './ProductTableRow'

interface ProductsTableProps {
  products: ProductWithDetails[]
  onAddToCart: (product: ProductWithDetails) => void
  searchTerm: string
  categoryFilter: string
}

export function ProductsTable({ products, onAddToCart, searchTerm, categoryFilter }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum produto encontrado</p>
        {searchTerm || categoryFilter ? (
          <p className="text-sm">Tente ajustar os filtros de busca</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="text-center">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductTableRow
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
