
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Package } from 'lucide-react'

const chartConfig = {
  stock: {
    label: "Estoque",
    color: "hsl(var(--chart-2))",
  },
  lowStock: {
    label: "Estoque Baixo",
    color: "hsl(var(--chart-3))",
  },
}

interface ProductsChartProps {
  data: Array<{
    category: string
    stock: number
    lowStock: number
  }>
}

export function ProductsChart({ data }: ProductsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-500" />
          <span>Estoque por Categoria</span>
        </CardTitle>
        <CardDescription>
          Distribuição do estoque e alertas de estoque baixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="stock" fill="var(--color-stock)" radius={4} />
            <Bar dataKey="lowStock" fill="var(--color-lowStock)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
