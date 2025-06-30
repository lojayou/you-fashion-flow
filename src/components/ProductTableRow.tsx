
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ShoppingCart } from 'lucide-react'
import { ProductWithDetails } from '@/hooks/useProductsWithDetails'

interface ProductTableRowProps {
  product: ProductWithDetails
  onAddToCart: (product: ProductWithDetails) => void
}

export function ProductTableRow({ product, onAddToCart }: ProductTableRowProps) {
  return (
    <TableRow>
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
                onClick={() => onAddToCart(product)}
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
  )
}
