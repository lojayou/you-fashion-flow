
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ConditionalProcessDialogProps {
  conditionalId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConditionalProcessDialog({ conditionalId, open, onOpenChange }: ConditionalProcessDialogProps) {
  const [action, setAction] = useState<'sell' | 'return' | ''>('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch conditional details
  const { data: conditional } = useQuery({
    queryKey: ['conditional-process', conditionalId],
    queryFn: async () => {
      if (!conditionalId) return null
      
      const { data, error } = await supabase
        .from('conditionals')
        .select('*')
        .eq('id', conditionalId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!conditionalId && open
  })

  // Fetch conditional items
  const { data: items = [] } = useQuery({
    queryKey: ['conditional-items-process', conditionalId],
    queryFn: async () => {
      if (!conditionalId) return []
      
      const { data, error } = await supabase
        .from('conditional_items')
        .select('*')
        .eq('conditional_id', conditionalId)
      
      if (error) throw error
      return data
    },
    enabled: !!conditionalId && open
  })

  // Process conditional mutation
  const processConditionalMutation = useMutation({
    mutationFn: async ({ action }: { action: 'sell' | 'return' }) => {
      if (!conditionalId) throw new Error('ID do condicional não encontrado')

      if (action === 'sell') {
        // Convert conditional to sale
        const orderNumber = `PDV-${Date.now()}`
        
        // Create order
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_name: conditional?.customer_name,
            customer_phone: conditional?.customer_phone,
            customer_id: conditional?.customer_id,
            total_amount: conditional?.total_value,
            status: 'confirmed',
            payment_method: 'Condicional Finalizada'
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Create order items from conditional items
        const orderItems = items.map(item => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          size: item.size,
          color: item.color
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError

        // Update conditional status to sold
        const { error: updateError } = await supabase
          .from('conditionals')
          .update({ status: 'sold' })
          .eq('id', conditionalId)

        if (updateError) throw updateError

      } else if (action === 'return') {
        // Update conditional status to returned
        const { error: updateError } = await supabase
          .from('conditionals')
          .update({ status: 'returned' })
          .eq('id', conditionalId)

        if (updateError) throw updateError
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Sucesso!',
        description: variables.action === 'sell' 
          ? 'Condicional finalizada como venda com sucesso!'
          : 'Condicional marcada como devolvida com sucesso!',
      })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['conditionals'] })
      onOpenChange(false)
      setAction('')
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao processar condicional: ' + error.message,
        variant: 'destructive',
      })
    }
  })

  const handleProcess = () => {
    if (!action) return
    processConditionalMutation.mutate({ action })
  }

  if (!conditional) return null

  const isOverdue = conditional.due_date && new Date(conditional.due_date) < new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Processar Condicional #{conditional.id.slice(0, 8)}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Condicional</Badge>
              {isOverdue && <Badge variant="destructive">Atrasado</Badge>}
            </div>
          </DialogTitle>
          <DialogDescription>
            Finalize a condicional como venda ou marque como devolvida
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{conditional.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{conditional.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Conditional Info */}
          <div>
            <h3 className="font-semibold mb-2">Informações da Condicional</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                <p className="font-medium">
                  {new Date(conditional.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium text-lg text-green-600">
                  R$ {Number(conditional.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                  {isOverdue ? 'Atrasado' : 'Ativo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-2">Itens</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Variações</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.size && <Badge variant="outline" className="text-xs">{item.size}</Badge>}
                        {item.color && <Badge variant="outline" className="text-xs">{item.color}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      R$ {Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(item.unit_price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Action Selection */}
          <div>
            <h3 className="font-semibold mb-2">Ação</h3>
            <Select value={action} onValueChange={(value: 'sell' | 'return') => setAction(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell">Finalizar como Venda</SelectItem>
                <SelectItem value="return">Marcar como Devolvida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleProcess}
            disabled={!action || processConditionalMutation.isPending}
            className={action === 'sell' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {processConditionalMutation.isPending ? 'Processando...' : 
             action === 'sell' ? 'Finalizar Venda' : 
             action === 'return' ? 'Marcar como Devolvida' : 'Processar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
