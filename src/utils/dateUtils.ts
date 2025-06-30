
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

// Utilitário para converter UTC para horário de Brasília
export function toBrazilTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(dateObj, BRAZIL_TIMEZONE)
}

// Formatação padrão brasileira DD/MM/YYYY
export function formatBrazilianDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, 'dd/MM/yyyy', { locale: ptBR })
}

// Formatação com hora DD/MM/YYYY HH:mm
export function formatBrazilianDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

// Formatação abreviada DD/MM
export function formatBrazilianDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, 'dd/MM', { locale: ptBR })
}

// Formatação para tooltips de gráficos
export function formatChartTooltipDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, 'dd/MM/yyyy', { locale: ptBR })
}

// Formatação para eixo X de gráficos
export function formatChartAxisDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, BRAZIL_TIMEZONE, 'dd/MM', { locale: ptBR })
}

// Formatação de mês/ano para gráficos mensais
export function formatMonthYear(dateString: string): string {
  const [year, month] = dateString.split('-')
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

// Obter início e fim do dia em horário de Brasília
export function getBrazilDayRange(date: Date): { start: Date, end: Date } {
  const brazilDate = toBrazilTime(date)
  const start = new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate(), 0, 0, 0, 0)
  const end = new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate(), 23, 59, 59, 999)
  
  return { start, end }
}
