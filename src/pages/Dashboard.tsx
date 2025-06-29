import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TimeFilter } from '@/components/TimeFilter'
import { useDashboardData } from '@/hooks/useDashboardData'
import { TimeFilterOption, DateRange } from '@/utils/dateFilters'
import { 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  DollarSign,
  BarChart3,
  Download
} from 'lucide-react'
import { useDynamicSalesChart } from '@/hooks/useDynamicSalesChart'
import { DynamicSalesChart } from '@/components/Charts/DynamicSalesChart'

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFilterOption>('today')
  const [customDates, setCustomDates] = useState<DateRange>()

  const { 
    conditionalStats, 
    orderStats, 
    lowStockCount, 
    recentConditionals,
    isLoading 
  } = useDashboardData({ 
    period: selectedPeriod, 
    customDates 
  })

  const { data: dynamicSalesData, grouping: salesGrouping, isLoading: salesLoading } = useDynamicSalesChart({ 
    period: selectedPeriod, 
    customDates 
  })

  const handlePeriodChange = (period: TimeFilterOption, customDates?: DateRange) => {
    console.log('Period changed to:', period, customDates)
    setSelectedPeriod(period)
    setCustomDates(customDates)
  }

  const exportConditionalsToCSV = () => {
    if (recentConditionals.length === 0) {
      alert('Não há condicionais para exportar')
      return
    }

    const headers = ['Cliente', 'Telefone', 'Valor', 'Peças', 'Vencimento', 'Status']
    const csvData = recentConditionals.map(conditional => [
      conditional.customerName,
      conditional.phone,
      `R$ ${conditional.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      conditional.items,
      new Date(conditional.dueDate).toLocaleDateString('pt-BR'),
      conditional.status === 'overdue' ? 'Atrasado' : 'Ativo'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `condicionais_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema You Fashion & Style</p>
        </div>
        <TimeFilter onPeriodChange={handlePeriodChange} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Condicional</CardTitle>
            <DollarSign className="h-4 w-4 text-copper-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-copper-600">
              R$ {conditionalStats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {conditionalStats.total} condicionais ativas
            </p>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {orderStats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {orderStats.totalOrders} pedidos finalizados
            </p>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devoluções Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{conditionalStats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Condicionais a vencer/atrasadas
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
              {lowStockCount + conditionalStats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              {lowStockCount} estoque baixo, {conditionalStats.overdue} atrasados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <div className="grid grid-cols-1 gap-6">
        <DynamicSalesChart 
          data={dynamicSalesData} 
          grouping={salesGrouping} 
          isLoading={salesLoading} 
        />
      </div>

      {/* Recent Conditionals and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-copper-500" />
                <CardTitle>Condicionais Ativos</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConditionalsToCSV}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </Button>
            </div>
            <CardDescription>
              Clientes com peças em condicional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentConditionals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma condicional encontrada
                  </p>
                ) : (
                  recentConditionals.map((conditional) => (
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
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-copper-500" />
              <span>Resumo Operacional</span>
            </CardTitle>
            <CardDescription>
              Principais indicadores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total de Condicionais</span>
                <span className="font-medium">{conditionalStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Valor Total em Condicional</span>
                <span className="font-medium">
                  R$ {conditionalStats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vendas do Dia</span>
                <span className="font-medium">{orderStats.totalOrders} pedidos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Itens com Estoque Baixo</span>
                <span className="font-medium text-orange-600">{lowStockCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Condicionais Atrasados</span>
                <span className="font-medium text-red-600">{conditionalStats.overdue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
