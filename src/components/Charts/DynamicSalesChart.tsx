
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatBrazilianDate, formatBrazilianDateShort, formatMonthYear } from '@/utils/dateUtils'

const chartConfig = {
  total_sales: {
    label: "Vendas",
    color: "hsl(var(--chart-1))",
  },
}

interface ChartDataPoint {
  label: string
  total_sales: number
  grouping: 'hour' | 'day' | 'week' | 'month'
}

interface DynamicSalesChartProps {
  data: ChartDataPoint[]
  grouping: 'hour' | 'day' | 'week' | 'month'
  isLoading?: boolean
}

export function DynamicSalesChart({ data, grouping, isLoading = false }: DynamicSalesChartProps) {
  console.log('Chart data:', data)
  console.log('Chart grouping:', grouping)

  const getChartTitle = () => {
    switch (grouping) {
      case 'hour': return 'Vendas por Hora'
      case 'day': return 'Vendas por Dia'
      case 'week': return 'Vendas por Semana'
      case 'month': return 'Vendas por Mês'
      default: return 'Vendas'
    }
  }

  const getChartDescription = () => {
    switch (grouping) {
      case 'hour': return 'Evolução das vendas por hora'
      case 'day': return 'Evolução das vendas diárias'
      case 'week': return 'Evolução das vendas semanais'
      case 'month': return 'Evolução das vendas mensais'
      default: return 'Evolução das vendas'
    }
  }

  const formatXAxisTick = (value: string) => {
    switch (grouping) {
      case 'hour':
        return value // Already in "HH:00" format
      
      case 'day':
        return formatBrazilianDateShort(value)
      
      case 'week':
        const [startDate] = value.split(' to ')
        return formatBrazilianDateShort(startDate)
      
      case 'month':
        return formatMonthYear(value)
      
      default:
        return value
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">
            {formatTooltipLabel(label, grouping)}
          </p>
          <p className="text-sm text-green-600">
            Vendas: R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  const formatTooltipLabel = (label: string, grouping: string) => {
    switch (grouping) {
      case 'hour':
        return `${label}`
      
      case 'day':
        return formatBrazilianDate(label)
      
      case 'week':
        const [start, end] = label.split(' to ')
        return `${formatBrazilianDate(start)} - ${formatBrazilianDate(end)}`
      
      case 'month':
        return formatMonthYear(label)
      
      default:
        return label
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Carregando...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Carregando dados...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span>{getChartTitle()}</span>
        </CardTitle>
        <CardDescription>
          {getChartDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Nenhum dado encontrado para o período selecionado
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart data={data} height={200}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatXAxisTick}
                interval={0}
                angle={grouping === 'week' ? -45 : 0}
                textAnchor={grouping === 'week' ? 'end' : 'middle'}
                height={grouping === 'week' ? 80 : 60}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Area
                dataKey="total_sales"
                type="natural"
                fill="var(--color-total_sales)"
                fillOpacity={0.4}
                stroke="var(--color-total_sales)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
