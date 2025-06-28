
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type TimeFilterOption = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'this-year' | 'custom'

interface TimeFilterProps {
  onPeriodChange: (period: TimeFilterOption, customDates?: { from: Date; to: Date }) => void
}

export function TimeFilter({ onPeriodChange }: TimeFilterProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFilterOption>('today')
  const [customFromDate, setCustomFromDate] = useState<Date>()
  const [customToDate, setCustomToDate] = useState<Date>()

  const handlePeriodChange = (value: TimeFilterOption) => {
    setSelectedPeriod(value)
    
    if (value !== 'custom') {
      onPeriodChange(value)
    }
  }

  const handleCustomDateApply = () => {
    if (customFromDate && customToDate) {
      onPeriodChange('custom', { from: customFromDate, to: customToDate })
    }
  }

  const isCustomDateValid = customFromDate && customToDate && customFromDate <= customToDate

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Período</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="this-week">Esta Semana</SelectItem>
              <SelectItem value="this-month">Este Mês</SelectItem>
              <SelectItem value="this-year">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customFromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customFromDate ? format(customFromDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customFromDate}
                      onSelect={setCustomFromDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data Final</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customToDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customToDate ? format(customToDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customToDate}
                      onSelect={setCustomToDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button 
                onClick={handleCustomDateApply}
                disabled={!isCustomDateValid}
                className="bg-copper-500 hover:bg-copper-600"
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
