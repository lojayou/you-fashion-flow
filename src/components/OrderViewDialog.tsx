
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  size?: string
  color?: string
}

interface OrderViewDialogProps {
  orderId: string | null
  orderType: 'sale' | 'conditional'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderViewDialog({ orderId, orderType, open, onOpenChange }: OrderViewDialogProps) {
  // Fetch order details
  const { data: order } = useQuery({
    queryKey: ['order-details', orderId, orderType],
    queryFn: async () => {
      if (!orderId) return null
      
      if (orderType === 'sale') {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('conditionals')
          .select('*')
          .eq('id', orderId)
          .single()
        
        if (error) throw error
        return {
          ...data,
          order_number: `COND-${data.id.slice(0, 8)}`,
          total_amount: data.total_value
        }
      }
    },
    enabled: !!orderId && open
  })

  // Fetch order items
  const { data: items = [] } = useQuery({
    queryKey: ['order-items', orderId, orderType],
    queryFn: async () => {
      if (!orderId) return []
      
      if (orderType === 'sale') {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('conditional_items')
          .select('*')
          .eq('conditional_id', orderId)
        
        if (error) throw error
        return data
      }
    },
    enabled: !!orderId && open
  })

  if (!order) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { label: 'Finalizado', variant: 'secondary' as const },
      confirmed: { label: 'Finalizado', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      active: { label: 'Condicional', variant: 'secondary' as const },
      overdue: { label: 'Atrasado', variant: 'destructive' as const },
      cancelled: { label: 'Cancelado', variant: 'outline' as const },
      returned: { label: 'Devolvido', variant: 'outline' as const },
      sold: { label: 'Vendido', variant: 'secondary' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Pedido #{order.order_number}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {orderType === 'sale' ? 'Venda' : 'Condicional'}
              </Badge>
              {getStatusBadge(order.status)}
            </div>
          </DialogTitle>
          <DialogDescription>
            Detalhamento completo do pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações do Pedido */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informações do Pedido</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Data de Criação</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              {orderType === 'conditional' && 'due_date' in order && order.due_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                  <p className="font-medium">{new Date(order.due_date).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-medium text-lg text-green-600">
                  R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {orderType === 'sale' && 'payment_method' in order && order.payment_method && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                <p className="font-medium">{order.payment_method}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Itens do Pedido */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Variações</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.product_name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {item.size && (
                          <Badge variant="outline" className="text-xs">
                            {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="outline" className="text-xs">
                            {item.color}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(item.total_price || item.unit_price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Resumo Financeiro */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total do Pedido:</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
