import { addDays, format, parseISO, subDays } from 'date-fns'
import type { NotificationPreference } from '../types'

const escapeIcsText = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll('\n', '\\n')

const toIcsDate = (isoDate: string) => format(parseISO(isoDate), 'yyyyMMdd')

const getReminderDate = (
  predictedStartDate: string,
  preference: NotificationPreference,
) => {
  switch (preference) {
    case 'three-days-before':
      return format(subDays(parseISO(predictedStartDate), 3), 'yyyyMMdd')
    case 'one-day-before':
      return format(subDays(parseISO(predictedStartDate), 1), 'yyyyMMdd')
    case 'same-day':
      return toIcsDate(predictedStartDate)
    case 'off':
      return undefined
  }
}

export const createReminderCalendar = ({
  predictedStartDate,
  preference,
  generatedAt,
}: {
  predictedStartDate: string
  preference: NotificationPreference
  generatedAt: Date
}) => {
  const reminderDate = getReminderDate(predictedStartDate, preference)

  if (!reminderDate) {
    throw new Error('Choose a reminder preference before exporting a calendar reminder.')
  }

  const reminderIsoDate = `${reminderDate.slice(0, 4)}-${reminderDate.slice(4, 6)}-${reminderDate.slice(6, 8)}`
  const endDate = format(addDays(parseISO(reminderIsoDate), 1), 'yyyyMMdd')
  const stamp = generatedAt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const uid = `cyclekind-${predictedStartDate}-${preference}@cyclekind.local`
  const summary = 'CycleKind reminder'
  const description =
    'Your next period may start around this date. Estimated from your selected cycle length.'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CycleKind//Reminder Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${reminderDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(summary)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}
