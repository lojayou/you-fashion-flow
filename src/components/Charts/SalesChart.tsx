
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
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span>Vendas dos Últimos 7 Dias</span>
        </CardTitle>
        <CardDescription>
          Evolução das vendas diárias
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
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              }}
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
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
