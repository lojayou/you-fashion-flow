
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const chartConfig = {
  sales: {
    label: "Vendas",
    color: "hsl(var(--chart-1))",
  },
}

interface SalesChartProps {
  data: Array<{
    date: string
    sales: number
  }>
  isHourlyData?: boolean
}

export function SalesChart({ data, isHourlyData = false }: SalesChartProps) {
  const getChartTitle = () => {
    if (isHourlyData) {
      return "Vendas por Hora"
    }
    return "Vendas por Dia"
  }

  const getChartDescription = () => {
    if (isHourlyData) {
      return "Evolução das vendas por hora"
    }
    return "Evolução das vendas diárias"
  }

  const formatXAxisTick = (value: string) => {
    if (isHourlyData) {
      return value // Já está no formato "HH:00"
    }
    const date = new Date(value)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">
            {isHourlyData ? `${label}` : new Date(label).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm text-green-600">
            Vendas: R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
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
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado encontrado para o período selecionado
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart data={data}>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatXAxisTick}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Area
                dataKey="sales"
                type="natural"
                fill="var(--color-sales)"
                fillOpacity={0.4}
                stroke="var(--color-sales)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
