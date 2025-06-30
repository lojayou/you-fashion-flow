
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AutocompleteInput } from '@/components/AutocompleteInput'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  product_code: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  salePrice: z.number().min(0.01, 'Preço deve ser maior que zero'),
  costPrice: z.number().optional(),
  stock: z.number().min(0, 'Estoque não pode ser negativo'),
  minStock: z.number().min(0, 'Estoque mínimo não pode ser negativo'),
  size: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  featured: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated: () => void
}

// Opções pré-definidas de tamanho
const SIZE_OPTIONS = ['P', 'M', 'G', 'GG']

export function ProductCreateDialog({ open, onOpenChange, onProductCreated }: ProductCreateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState({
    categories: [] as string[],
    brands: [] as string[],
    sizes: [] as string[],
    colors: [] as string[]
  })
  const { toast } = useToast()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      product_code: '',
      description: '',
      category: '',
      brand: '',
      salePrice: 0,
      costPrice: 0,
      stock: 0,
      minStock: 5,
      size: '',
      color: '',
      status: 'active',
      featured: false,
    },
  })

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select('category, brand, size, color')
          .eq('status', 'active')

        if (error) throw error

        const categories = [...new Set(products?.filter(p => p.category).map(p => p.category) || [])]
        const brands = [...new Set(products?.filter(p => p.brand).map(p => p.brand) || [])]
        const existingSizes = [...new Set(products?.filter(p => p.size).map(p => p.size) || [])]
        const colors = [...new Set(products?.filter(p => p.color).map(p => p.color) || [])]

        // Combinar tamanhos pré-definidos com os existentes
        const allSizes = [...new Set([...SIZE_OPTIONS, ...existingSizes])]

        setSuggestions({ categories, brands, sizes: allSizes, colors })
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error)
      }
    }

    fetchSuggestions()
  }, [])

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          sku: data.sku,
          product_code: data.product_code || null,
          description: data.description,
          category: data.category || null,
          brand: data.brand || null,
          sale_price: data.salePrice,
          cost_price: data.costPrice,
          stock: data.stock,
          min_stock: data.minStock,
          size: data.size || null,
          color: data.color || null,
          status: data.status,
          featured: data.featured,
        })

      if (error) throw error

      toast({
        title: 'Produto criado',
        description: 'O produto foi criado com sucesso.',
      })

      onProductCreated()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar o produto.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo produto.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="product_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Produto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <AutocompleteInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        suggestions={suggestions.categories}
                        placeholder="Digite ou selecione uma categoria"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <AutocompleteInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        suggestions={suggestions.brands}
                        placeholder="Digite ou selecione uma marca"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade em Estoque</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho</FormLabel>
                    <FormControl>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho" />
                        </SelectTrigger>
                        <SelectContent>
                          {suggestions.sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <AutocompleteInput
                        value={field.value || ''}
                        onChange={field.onChange}
                        suggestions={suggestions.colors}
                        placeholder="Digite ou selecione uma cor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Produto Destaque</FormLabel>
                      <FormDescription>
                        Marcar produto como destaque
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Produto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
