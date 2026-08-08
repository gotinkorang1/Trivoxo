'use client'

import { useMemo, useState } from 'react'
import { CalendarCheck, ChevronLeft, ChevronRight, Info, MessageCircle } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import {
  evaluateDateAvailability,
  firstRequestableDate,
  type AvailabilityRules,
  type DateWindow,
} from '@/lib/availability'
import type { Weekday } from '@/lib/data/experiences'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_FORMATTER = new Intl.DateTimeFormat('en-GH', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const DATE_FORMATTER = new Intl.DateTimeFormat('en-GH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

type AvailabilityCalendarProps = {
  slug: string
  minDate: string
  maxDate: string
  availabilityType?: AvailabilityRules['availabilityType']
  weekdays?: Weekday[]
  minNoticeHours?: number
  soldOut?: boolean
  includePublicHolidays?: boolean
}

export function AvailabilityCalendar({
  slug,
  minDate,
  maxDate,
  availabilityType,
  weekdays,
  minNoticeHours,
  soldOut,
  includePublicHolidays,
}: AvailabilityCalendarProps) {
  const rules = useMemo<AvailabilityRules>(
    () => ({ availabilityType, weekdays, minNoticeHours, soldOut }),
    [availabilityType, weekdays, minNoticeHours, soldOut],
  )
  const window = useMemo<DateWindow>(() => ({ minDate, maxDate }), [minDate, maxDate])
  const firstDate = useMemo(() => firstRequestableDate(rules, window), [rules, window])
  const [selectedDate, setSelectedDate] = useState(firstDate)
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(firstDate ?? minDate))
  const days = useMemo(() => monthCells(visibleMonth), [visibleMonth])
  const selectedLabel = selectedDate ? DATE_FORMATTER.format(parseDate(selectedDate)) : undefined
  const selectedAvailability = selectedDate
    ? evaluateDateAvailability(selectedDate, rules, window)
    : undefined
  const minMonth = monthStart(minDate)
  const maxMonth = monthStart(maxDate)
  const bookingHref = selectedDate
    ? `/experiences/${slug}/book?date=${selectedDate}`
    : `/experiences/${slug}/book`

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface-elevated shadow-soft">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              aria-label="Show previous month"
              disabled={visibleMonth <= minMonth}
              onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition hover:border-brand-primary hover:text-brand-link disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="size-5" />
            </button>
            <h3
              className="font-sans text-base font-bold tracking-normal text-text-primary"
              aria-live="polite"
            >
              {MONTH_FORMATTER.format(parseDate(visibleMonth))}
            </h3>
            <button
              type="button"
              aria-label="Show next month"
              disabled={visibleMonth >= maxMonth}
              onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition hover:border-brand-primary hover:text-brand-link disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 text-center" aria-hidden="true">
            {DAY_LABELS.map((day) => (
              <span
                key={day}
                className="py-2 text-xs font-bold uppercase tracking-[0.12em] text-text-muted"
              >
                {day}
              </span>
            ))}
          </div>

          <div
            role="group"
            aria-label={`Request dates for ${MONTH_FORMATTER.format(parseDate(visibleMonth))}`}
            className="grid grid-cols-7 gap-1"
          >
            {days.map((date, index) => {
              if (!date)
                return <span key={`empty-${index}`} aria-hidden="true" className="min-h-12" />
              const day = Number(date.slice(-2))
              const availability = evaluateDateAvailability(date, rules, window)
              const selected = date === selectedDate
              const dateLabel = DATE_FORMATTER.format(parseDate(date))

              return (
                <button
                  key={date}
                  type="button"
                  disabled={!availability.requestable}
                  aria-label={`${dateLabel}, ${availability.label}`}
                  aria-pressed={selected}
                  title={availability.reason}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'relative flex min-h-12 items-center justify-center rounded-xl border text-sm font-semibold transition',
                    availability.requestable
                      ? 'border-transparent bg-brand-accent-soft text-text-primary hover:border-brand-accent hover:shadow-sm'
                      : 'cursor-not-allowed border-transparent text-text-muted opacity-40',
                    selected &&
                      'border-brand-primary bg-brand-primary text-brand-navy shadow-sm hover:border-brand-primary',
                  )}
                >
                  {day}
                  {availability.requestable && !selected && (
                    <span
                      className="absolute bottom-1.5 size-1 rounded-full bg-brand-accent"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-brand-accent" /> Runs this day
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-brand-primary" /> Selected
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-surface-strong" /> Not running
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-border bg-surface p-6 lg:border-l lg:border-t-0">
          <div>
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand-secondary-soft text-brand-link">
              <CalendarCheck className="size-5" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
              Preferred date
            </p>
            {selectedLabel ? (
              <>
                <p className="mt-1 font-display text-2xl text-text-primary" aria-live="polite">
                  {selectedLabel}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-accent">
                  {selectedAvailability?.label}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-text-secondary">
                No requestable dates are currently shown.
              </p>
            )}
          </div>

          <div className="mt-7">
            {selectedDate ? (
              <ButtonLink href={bookingHref} size="lg" className="w-full">
                Request this date
              </ButtonLink>
            ) : (
              <ButtonLink
                href={`/contact?subject=${encodeURIComponent(`Availability for ${slug}`)}`}
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="size-4" /> Ask about dates
              </ButtonLink>
            )}
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-link" />
              Dates show the normal operating pattern, not live seat inventory. Trivoxo confirms
              capacity before payment.
            </p>
            {includePublicHolidays && (
              <p className="mt-2 text-xs text-text-muted">
                Ghana public holidays can also be requested.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function parseDate(date: string) {
  return new Date(`${date}T12:00:00.000Z`)
}

function monthStart(date: string) {
  return `${date.slice(0, 7)}-01`
}

function shiftMonth(month: string, amount: number) {
  const date = parseDate(month)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 10)
}

function monthCells(month: string): Array<string | undefined> {
  const first = parseDate(month)
  const year = first.getUTCFullYear()
  const monthIndex = first.getUTCMonth()
  const mondayOffset = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 12)).getUTCDate()
  const cells: Array<string | undefined> = Array.from({ length: mondayOffset }, () => undefined)

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, monthIndex, day, 12))
    cells.push(date.toISOString().slice(0, 10))
  }

  while (cells.length % 7 !== 0) cells.push(undefined)
  return cells
}
