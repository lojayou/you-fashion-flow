
import { toBrazilTime, getBrazilDayRange } from './dateUtils'

export type TimeFilterOption = 'today' | 'yesterday' | 'this-week' | 'this-month' | 'this-year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

export function getDateRangeFromPeriod(
  period: TimeFilterOption, 
  customDates?: DateRange
): DateRange {
  // Obter data atual no horário de Brasília
  const nowBrazil = toBrazilTime(new Date())
  const todayBrazil = new Date(nowBrazil.getFullYear(), nowBrazil.getMonth(), nowBrazil.getDate())
  
  switch (period) {
    case 'today': {
      const { start, end } = getBrazilDayRange(nowBrazil)
      return { from: start, to: end }
    }
    
    case 'yesterday': {
      const yesterdayBrazil = new Date(todayBrazil)
      yesterdayBrazil.setDate(todayBrazil.getDate() - 1)
      const { start, end } = getBrazilDayRange(yesterdayBrazil)
      return { from: start, to: end }
    }
    
    case 'this-week': {
      const startOfWeek = new Date(todayBrazil)
      const dayOfWeek = todayBrazil.getDay()
      // Ajustar para segunda-feira ser o primeiro dia (0 = domingo, 1 = segunda)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      startOfWeek.setDate(todayBrazil.getDate() + diff)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      return { from: startOfWeek, to: endOfWeek }
    }
    
    case 'this-month': {
      const startOfMonth = new Date(todayBrazil.getFullYear(), todayBrazil.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const endOfMonth = new Date(todayBrazil.getFullYear(), todayBrazil.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)
      
      return { from: startOfMonth, to: endOfMonth }
    }
    
    case 'this-year': {
      const startOfYear = new Date(todayBrazil.getFullYear(), 0, 1)
      startOfYear.setHours(0, 0, 0, 0)
      
      const endOfYear = new Date(todayBrazil.getFullYear(), 11, 31)
      endOfYear.setHours(23, 59, 59, 999)
      
      return { from: startOfYear, to: endOfYear }
    }
    
    case 'custom': {
      if (customDates) {
        const fromBrazil = new Date(customDates.from.getFullYear(), customDates.from.getMonth(), customDates.from.getDate())
        fromBrazil.setHours(0, 0, 0, 0)
        
        const toBrazil = new Date(customDates.to.getFullYear(), customDates.to.getMonth(), customDates.to.getDate())
        toBrazil.setHours(23, 59, 59, 999)
        
        return { from: fromBrazil, to: toBrazil }
      }
      // Fallback to today if no custom dates provided
      const { start, end } = getBrazilDayRange(nowBrazil)
      return { from: start, to: end }
    }
    
    default: {
      const { start, end } = getBrazilDayRange(nowBrazil)
      return { from: start, to: end }
    }
  }
}

// Função para determinar se deve mostrar dados por hora (apenas para hoje e ontem)
export function shouldShowHourlyData(period: TimeFilterOption): boolean {
  return period === 'today' || period === 'yesterday'
}
