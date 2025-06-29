
import { useState, useEffect } from 'react'
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

  // Debug effect
  useEffect(() => {
    console.log('🎯 ProductVariationSelector rendered for:', product.name)
    console.log('  Product ID:', product.id)
    console.log('  Colors:', product.colors)
    console.log('  Sizes:', product.sizes)
    console.log('  Stock:', product.stock)
    console.log('  Disabled:', disabled)
  }, [product, disabled])

  const handleAddToCart = () => {
    console.log('🛒 ProductVariationSelector - handleAddToCart called')
    console.log('  Product:', product.name)
    console.log('  Selected color:', selectedColor)
    console.log('  Selected size:', selectedSize)
    
    if (!selectedColor || !selectedSize) {
      console.log('❌ Missing selections - Color:', selectedColor, 'Size:', selectedSize)
      return
    }
    
    console.log('✅ Calling onAddToCart with:', product.id, selectedColor, selectedSize)
    onAddToCart(product.id, selectedColor, selectedSize)
    
    // Reset selections and hide selectors
    setSelectedColor('')
    setSelectedSize('')
    setShowSelectors(false)
  }

  const hasVariations = product.colors?.length > 0 || product.sizes?.length > 0
  const canAddToCart = !hasVariations || (selectedColor && selectedSize)

  console.log('🔍 ProductVariationSelector state:', {
    hasVariations,
    canAddToCart,
    showSelectors,
    productName: product.name
  })

  if (!showSelectors && hasVariations) {
    return (
      <Button
        size="sm"
        onClick={() => {
          console.log('👆 Opening selectors for:', product.name)
          setShowSelectors(true)
        }}
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
            <Select value={selectedColor} onValueChange={(value) => {
              console.log('🎨 Color selected:', value)
              setSelectedColor(value)
            }}>
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
            <Select value={selectedSize} onValueChange={(value) => {
              console.log('📏 Size selected:', value)
              setSelectedSize(value)
            }}>
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
              console.log('❌ Canceling selection for:', product.name)
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
      onClick={() => {
        console.log('🛒 Simple add to cart for:', product.name)
        onAddToCart(product.id, '', '')
      }}
      disabled={disabled || product.stock === 0}
      className="bg-copper-500 hover:bg-copper-600"
    >
      <Plus className="h-4 w-4" />
    </Button>
  )
}
