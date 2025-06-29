
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
    return "Vendas dos Últimos Dias"
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
              content={<ChartTooltipContent indicator="line" />}
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
      </CardContent>
    </Card>
  )
}
