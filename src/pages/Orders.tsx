import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TimeFilter } from '@/components/TimeFilter'
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
  orderNumber: string
  customerName: string
  customerPhone: string
  type: 'sale' | 'conditional'
  status: 'completed' | 'pending' | 'conditional' | 'overdue' | 'cancelled'
  items: number
  total: number
  paymentMethod?: string
  createdAt: string
  dueDate?: string
  userId: string
  userName: string
}

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: '001',
      customerName: 'Maria Silva',
      customerPhone: '(11) 99999-9999',
      type: 'conditional',
      status: 'conditional',
      items: 3,
      total: 450.00,
      createdAt: '2025-06-08T10:30:00',
      dueDate: '2025-06-15T23:59:59',
      userId: '1',
      userName: 'Admin'
    },
    {
      id: '2',
      orderNumber: '002',
      customerName: 'Ana Costa',
      customerPhone: '(11) 98888-8888',
      type: 'conditional',
      status: 'overdue',
      items: 2,
      total: 320.00,
      createdAt: '2025-06-01T14:20:00',
      dueDate: '2025-06-07T23:59:59',
      userId: '1',
      userName: 'Admin'
    },
    {
      id: '3',
      orderNumber: '003',
      customerName: 'Julia Santos',
      customerPhone: '(11) 97777-7777',
      type: 'sale',
      status: 'completed',
      items: 2,
      total: 259.80,
      paymentMethod: 'Cartão',
      createdAt: '2025-06-08T16:45:00',
      userId: '1',
      userName: 'Admin'
    },
    {
      id: '4',
      orderNumber: '004',
      customerName: 'Carla Oliveira',
      customerPhone: '(11) 96666-6666',
      type: 'conditional',
      status: 'conditional',
      items: 4,
      total: 680.00,
      createdAt: '2025-06-08T11:15:00',
      dueDate: '2025-06-20T23:59:59',
      userId: '1',
      userName: 'Admin'
    }
  ]

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm) ||
                         order.orderNumber.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesType = typeFilter === 'all' || order.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      completed: { label: 'Finalizado', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      conditional: { label: 'Condicional', variant: 'secondary' as const },
      overdue: { label: 'Atrasado', variant: 'destructive' as const },
      cancelled: { label: 'Cancelado', variant: 'outline' as const }
    }
    
    const config = statusConfig[status]
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

  const conditionalOrders = mockOrders.filter(order => order.type === 'conditional' && order.status === 'conditional')
  const overdueOrders = mockOrders.filter(order => order.status === 'overdue')
  const todaysOrders = mockOrders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">Gestão de vendas e condicionais</p>
      </div>

      {/* Time Filter */}
      <TimeFilter onPeriodChange={handlePeriodChange} />

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
                <SelectItem value="conditional">Condicional</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
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
          {filteredOrders.length === 0 ? (
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
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex space-x-2">
                          {getTypeBadge(order.type)}
                          {getStatusBadge(order.status)}
                        </div>
                        {order.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Vence: {new Date(order.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items} {order.items === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Por: {order.userName}
                        </p>
                        {order.paymentMethod && (
                          <p className="text-xs text-muted-foreground">
                            {order.paymentMethod}
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
                        
                        {order.type === 'conditional' && order.status === 'conditional' && (
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
