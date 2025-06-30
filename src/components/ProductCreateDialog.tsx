
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AutocompleteInput } from '@/components/AutocompleteInput'
import { useProductsWithDetails } from '@/hooks/useProductsWithDetails'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ProductCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated: () => void
}

export function ProductCreateDialog({
  open,
  onOpenChange,
  onProductCreated
}: ProductCreateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    color: '',
    size: '',
    sale_price: '',
    stock: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: existingProducts = [] } = useProductsWithDetails()

  // Extract unique values for autocomplete
  const uniqueCategories = [...new Set(existingProducts.map(p => p.category).filter(Boolean))]
  const uniqueBrands = [...new Set(existingProducts.map(p => p.brand).filter(Boolean))]
  const uniqueColors = [...new Set(existingProducts.map(p => p.color).filter(Boolean))]
  const uniqueSizes = [...new Set(existingProducts.map(p => p.size).filter(Boolean))]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          sku: formData.sku,
          description: formData.description || null,
          category: formData.category || null,
          brand: formData.brand || null,
          color: formData.color || null,
          size: formData.size || null,
          sale_price: parseFloat(formData.sale_price),
          stock: parseInt(formData.stock),
          status: 'active'
        })

      if (error) throw error

      toast({
        title: 'Produto criado',
        description: 'O produto foi criado com sucesso.',
      })

      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        brand: '',
        color: '',
        size: '',
        sale_price: '',
        stock: ''
      })

      onProductCreated()
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar o produto.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder=""
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <AutocompleteInput
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                placeholder=""
                suggestions={uniqueCategories}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <AutocompleteInput
                value={formData.brand}
                onChange={(value) => handleInputChange('brand', value)}
                placeholder=""
                suggestions={uniqueBrands}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <AutocompleteInput
                value={formData.color}
                onChange={(value) => handleInputChange('color', value)}
                placeholder=""
                suggestions={uniqueColors}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <AutocompleteInput
                value={formData.size}
                onChange={(value) => handleInputChange('size', value)}
                placeholder=""
                suggestions={uniqueSizes}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda *</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => handleInputChange('sale_price', e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-copper-500 hover:bg-copper-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
