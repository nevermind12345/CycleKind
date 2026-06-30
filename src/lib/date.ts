import { format, parseISO } from 'date-fns'

export const toIsoDate = (date: Date) => format(date, 'yyyy-MM-dd')

export const formatFriendlyDate = (isoDate?: string) => {
  if (!isoDate) {
    return 'No date recorded yet'
  }

  return format(parseISO(isoDate), 'd MMM yyyy')
}

export const todayIsoDate = () => toIsoDate(new Date())
