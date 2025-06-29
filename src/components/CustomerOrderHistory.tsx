
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/integrations/supabase/client'
import { Package, Calendar, DollarSign } from 'lucide-react'
import { OrderViewDialog } from './OrderViewDialog'

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
  payment_method?: string
}

interface CustomerOrderHistoryProps {
  customerId: string
  customerName: string
}

export function CustomerOrderHistory({ customerId, customerName }: CustomerOrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  useEffect(() => {
    fetchCustomerOrders()
  }, [customerId])

  const fetchCustomerOrders = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar pedidos do cliente:', error)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Finalizado', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderDialogOpen(true)
  }

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando histórico de pedidos...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Histórico de Pedidos - {customerName}</h4>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{orders.length} pedidos</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum pedido encontrado para este cliente
        </p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className="cursor-pointer hover:bg-copper-50/20 transition-colors"
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <TableCell>
                      <div className="font-medium">#{order.order_number}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {order.payment_method || 'N/A'}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <span className="font-medium">
                        R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <OrderViewDialog
        orderId={selectedOrderId}
        orderType="sale"
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
      />
    </div>
  )
}
