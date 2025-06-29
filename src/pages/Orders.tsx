import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TimeFilter } from '@/components/TimeFilter'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { 
  Search, 
  Filter, 
  Package, 
  Calendar,
  User,
  DollarSign,
  Eye,
  RotateCcw,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone?: string
  customer_id?: string
  type: 'sale' | 'conditional'
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'active' | 'overdue' | 'returned' | 'sold'
  total_amount: number
  payment_method?: string
  created_at: string
  due_date?: string
  created_by?: string
}

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch orders (vendas) - revalidate every 30 seconds to catch new orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(order => ({
        ...order,
        type: 'sale' as const,
        status: order.status || 'pending'
      }))
    },
    refetchInterval: 30000 // Revalida a cada 30 segundos
  })

  // Fetch conditionals (condicionais) - revalidate every 30 seconds to catch new conditionals
  const { data: conditionals = [], isLoading: conditionalsLoading } = useQuery({
    queryKey: ['conditionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conditionals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(conditional => ({
        id: conditional.id,
        order_number: `COND-${conditional.id.slice(0, 8)}`,
        customer_name: conditional.customer_name,
        customer_phone: conditional.customer_phone,
        customer_id: conditional.customer_id,
        type: 'conditional' as const,
        status: conditional.status as Order['status'],
        total_amount: conditional.total_value,
        created_at: conditional.created_at,
        due_date: conditional.due_date,
        created_by: conditional.created_by
      }))
    },
    refetchInterval: 30000 // Revalida a cada 30 segundos
  })

  const isLoading = ordersLoading || conditionalsLoading

  // Combine orders and conditionals
  const allOrders: Order[] = [...orders, ...conditionals]

  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer_phone && order.customer_phone.includes(searchTerm)) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && (order.status === 'delivered' || order.status === 'confirmed')) ||
                         (statusFilter === 'active' && order.status === 'active') ||
                         (statusFilter === 'overdue' && order.status === 'overdue') ||
                         (statusFilter === 'cancelled' && order.status === 'cancelled') ||
                         (statusFilter === 'pending' && order.status === 'pending')
    
    const matchesType = typeFilter === 'all' || order.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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

  const getTypeBadge = (type: Order['type']) => {
    return (
      <Badge variant="outline">
        {type === 'sale' ? 'Venda' : 'Condicional'}
      </Badge>
    )
  }

  const handleProcessReturn = (orderId: string) => {
    console.log('Processing return for order:', orderId)
  }

  const handleViewOrder = (orderId: string) => {
    console.log('Viewing order:', orderId)
  }

  const handlePeriodChange = (period: string, customDates?: { from: Date; to: Date }) => {
    console.log('Period changed to:', period, customDates)
    // Aqui você implementaria a lógica para filtrar os pedidos baseado no período
  }

  const conditionalOrders = allOrders.filter(order => order.type === 'conditional' && order.status === 'active')
  const overdueOrders = allOrders.filter(order => order.status === 'overdue')
  const todaysOrders = allOrders.filter(order => {
    const orderDate = new Date(order.created_at).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">Gestão de vendas e condicionais</p>
        </div>
        <TimeFilter onPeriodChange={handlePeriodChange} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Condicionais Ativos</p>
                <p className="text-2xl font-bold text-copper-600">{conditionalOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-copper-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{overdueOrders.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                <p className="text-2xl font-bold text-green-600">{todaysOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, telefone ou pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Finalizado</SelectItem>
                <SelectItem value="active">Condicional</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="sale">Vendas</SelectItem>
                <SelectItem value="conditional">Condicionais</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos ({filteredOrders.length})</CardTitle>
          <CardDescription>Histórico de vendas e condicionais</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              Carregando pedidos...
            </p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum pedido encontrado com os filtros aplicados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo/Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        {order.customer_phone && (
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex space-x-2">
                          {getTypeBadge(order.type)}
                          {getStatusBadge(order.status)}
                        </div>
                        {order.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Vence: {new Date(order.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {order.payment_method && (
                          <p className="text-xs text-muted-foreground">
                            {order.payment_method}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {order.type === 'conditional' && order.status === 'active' && (
                          <Button
                            size="sm"
                            className="bg-copper-500 hover:bg-copper-600"
                            onClick={() => handleProcessReturn(order.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Processar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
