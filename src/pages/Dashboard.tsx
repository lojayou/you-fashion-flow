
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimeFilter } from '@/components/TimeFilter'
import { 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  // Mock data - in real app, this would come from API
  const stats = {
    totalConditionals: 23,
    conditionalValue: 4560.50,
    conditionalItems: 47,
    pendingReturns: 8,
    todaySales: 2340.00,
    todayOrders: 12,
    lowStockItems: 5,
    overdueConditionals: 3
  }

  const recentConditionals = [
    {
      id: '1',
      customerName: 'Maria Silva',
      phone: '(11) 99999-9999',
      items: 3,
      value: 450.00,
      dueDate: '2025-06-10',
      status: 'active'
    },
    {
      id: '2',
      customerName: 'Ana Costa',
      phone: '(11) 98888-8888',
      items: 2,
      value: 320.00,
      dueDate: '2025-06-09',
      status: 'overdue'
    },
    {
      id: '3',
      customerName: 'Julia Santos',
      phone: '(11) 97777-7777',
      items: 4,
      value: 680.00,
      dueDate: '2025-06-11',
      status: 'active'
    }
  ]

  const handlePeriodChange = (period: string, customDates?: { from: Date; to: Date }) => {
    console.log('Period changed to:', period, customDates)
    // Aqui você implementaria a lógica para filtrar os dados baseado no período
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema You Fashion & Style</p>
      </div>

      {/* Time Filter */}
      <TimeFilter onPeriodChange={handlePeriodChange} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Condicional</CardTitle>
            <DollarSign className="h-4 w-4 text-copper-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-copper-600">
              R$ {stats.conditionalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.conditionalItems} peças em {stats.totalConditionals} condicionais
            </p>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.todaySales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.todayOrders} pedidos finalizados
            </p>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devoluções Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReturns}</div>
            <p className="text-xs text-muted-foreground">
              Condicionais a vencer
            </p>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems + stats.overdueConditionals}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockItems} estoque baixo, {stats.overdueConditionals} atrasados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conditionals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-copper-500" />
              <span>Condicionais Ativos</span>
            </CardTitle>
            <CardDescription>
              Clientes com peças em condicional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConditionals.map((conditional) => (
                <div 
                  key={conditional.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{conditional.customerName}</p>
                    <p className="text-sm text-muted-foreground">{conditional.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence em: {new Date(conditional.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {conditional.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">{conditional.items} peças</p>
                    <Badge 
                      variant={conditional.status === 'overdue' ? 'destructive' : 'secondary'}
                      className="mt-1"
                    >
                      {conditional.status === 'overdue' ? 'Atrasado' : 'Ativo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-copper-500" />
              <span>Resumo Operacional</span>
            </CardTitle>
            <CardDescription>
              Principais indicadores do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Condicionais</span>
                <span className="font-medium">{stats.totalConditionals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Peças em Condicional</span>
                <span className="font-medium">{stats.conditionalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vendas do Dia</span>
                <span className="font-medium">{stats.todayOrders} pedidos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Itens com Estoque Baixo</span>
                <span className="font-medium text-orange-600">{stats.lowStockItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Condicionais Atrasados</span>
                <span className="font-medium text-red-600">{stats.overdueConditionals}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
