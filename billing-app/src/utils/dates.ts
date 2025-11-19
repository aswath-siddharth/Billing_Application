import { format, parseISO } from 'date-fns'

export const isoNow = () => new Date().toISOString()

export const toMonthKey = (date: string | Date) => {
  const instance = typeof date === 'string' ? parseISO(date) : date
  return format(instance, 'yyyy-MM')
}

export const formatFinancialYearName = (start: Date) => {
  const next = new Date(start)
  next.setFullYear(next.getFullYear() + 1)
  return `${format(start, 'yyyy')}-${format(next, 'yyyy')}`
}

