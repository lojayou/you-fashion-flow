
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { Product } from '@/hooks/useProducts'

interface ProductVariationSelectorProps {
  product: Product
  onAddToCart: (productId: string, color: string, size: string) => void
  disabled?: boolean
}

export const ProductVariationSelector = ({ 
  product, 
  onAddToCart, 
  disabled = false 
}: ProductVariationSelectorProps) => {
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [showSelectors, setShowSelectors] = useState(false)

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      return
    }
    
    onAddToCart(product.id, selectedColor, selectedSize)
    
    // Reset selections and hide selectors
    setSelectedColor('')
    setSelectedSize('')
    setShowSelectors(false)
  }

  const hasVariations = product.colors?.length > 0 || product.sizes?.length > 0
  const canAddToCart = !hasVariations || (selectedColor && selectedSize)

  if (!showSelectors && hasVariations) {
    return (
      <Button
        size="sm"
        onClick={() => setShowSelectors(true)}
        disabled={disabled || product.stock === 0}
        className="bg-copper-500 hover:bg-copper-600"
      >
        <Plus className="h-4 w-4" />
      </Button>
    )
  }

  if (showSelectors && hasVariations) {
    return (
      <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Cor</Label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {product.colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Tamanho</Label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {product.sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!canAddToCart || product.stock === 0}
            className="bg-copper-500 hover:bg-copper-600 flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowSelectors(false)
              setSelectedColor('')
              setSelectedSize('')
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  // For products without variations, show simple add button
  return (
    <Button
      size="sm"
      onClick={() => onAddToCart(product.id, '', '')}
      disabled={disabled || product.stock === 0}
      className="bg-copper-500 hover:bg-copper-600"
    >
      <Plus className="h-4 w-4" />
    </Button>
  )
}
