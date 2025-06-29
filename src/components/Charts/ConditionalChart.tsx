
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Clock, AlertTriangle } from 'lucide-react'

const chartConfig = {
  active: {
    label: "Ativos",
    color: "hsl(var(--chart-1))",
  },
  overdue: {
    label: "Atrasados",
    color: "hsl(var(--chart-5))",
  },
}

interface ConditionalChartProps {
  data: Array<{
    date: string
    active: number
    overdue: number
  }>
}

export function ConditionalChart({ data }: ConditionalChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <span>Condicionais - Últimos 7 Dias</span>
        </CardTitle>
        <CardDescription>
          Evolução dos condicionais ativos e atrasados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
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
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="active"
              type="monotone"
              stroke="var(--color-active)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="overdue"
              type="monotone"
              stroke="var(--color-overdue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
