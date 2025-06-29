
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { CreditCard } from 'lucide-react'

const chartConfig = {
  pix: {
    label: "PIX",
    color: "hsl(var(--chart-1))",
  },
  cartao: {
    label: "Cartão",
    color: "hsl(var(--chart-2))",
  },
  dinheiro: {
    label: "Dinheiro",
    color: "hsl(var(--chart-3))",
  },
  outros: {
    label: "Outros",
    color: "hsl(var(--chart-4))",
  },
}

interface PaymentMethodsChartProps {
  data: Array<{
    method: string
    value: number
    fill: string
  }>
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-copper-500" />
          <span>Métodos de Pagamento</span>
        </CardTitle>
        <CardDescription>
          Distribuição dos pagamentos por método
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="method"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="method" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
