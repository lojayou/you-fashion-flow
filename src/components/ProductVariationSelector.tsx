
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  // Debug effect
  useEffect(() => {
    console.log('🎯 ProductVariationSelector rendered for:', product.name)
    console.log('  Product ID:', product.id)
    console.log('  Color:', product.color)
    console.log('  Size:', product.size)
    console.log('  Stock:', product.stock)
    console.log('  Disabled:', disabled)
  }, [product, disabled])

  const handleAddToCart = () => {
    console.log('🛒 ProductVariationSelector - handleAddToCart called')
    console.log('  Product:', product.name)
    console.log('  Color:', product.color || '')
    console.log('  Size:', product.size || '')
    
    console.log('✅ Calling onAddToCart with:', product.id, product.color || '', product.size || '')
    onAddToCart(product.id, product.color || '', product.size || '')
  }

  console.log('🔍 ProductVariationSelector state:', {
    productName: product.name,
    color: product.color,
    size: product.size
  })

  return (
    <Button
      size="sm"
      onClick={handleAddToCart}
      disabled={disabled || product.stock === 0}
      className="bg-copper-500 hover:bg-copper-600"
    >
      <Plus className="h-4 w-4" />
    </Button>
  )
}
