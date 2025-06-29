
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { TimeFilterOption, DateRange } from '@/utils/dateFilters'

interface TimeFilterProps {
  onPeriodChange: (period: TimeFilterOption, customDates?: DateRange) => void
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
    <div className="flex items-center space-x-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-40 h-8 text-xs">
          <SelectValue placeholder="Período" />
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
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  !customFromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {customFromDate ? format(customFromDate, "dd/MM") : "De"}
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  !customToDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {customToDate ? format(customToDate, "dd/MM") : "Até"}
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

          <Button 
            size="sm"
            onClick={handleCustomDateApply}
            disabled={!isCustomDateValid}
            className="bg-copper-500 hover:bg-copper-600 h-8 text-xs px-2"
          >
            OK
          </Button>
        </div>
      )}
    </div>
  )
}
