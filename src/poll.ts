export const POLL_QUESTION = 'Baldurs Gate 3 next sesh'
export const POLL_DURATION_HOURS = 72
export const POLL_ALLOW_MULTISELECT = true

const TIME_ZONE = 'America/Chicago'

function getCentralDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: TIME_ZONE,
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  )

  return { year: values.year, month: values.month, day: values.day }
}

/**
 * Generates 7 poll answer strings starting the day after tomorrow.
 * Format: "Monday (MM/DD @ 8pm Central)"
 * @param baseDate - base date to calculate from, defaults to now
 */
export function generatePollAnswers(baseDate: Date = new Date()): { poll_media: { text: string } }[] {
  const answers: { poll_media: { text: string } }[] = []
  const centralDate = getCentralDateParts(baseDate)
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' })

  for (let i = 2; i <= 8; i++) {
    // Add calendar days, rather than 24-hour intervals, so daylight saving changes cannot repeat or skip a date.
    const d = new Date(Date.UTC(centralDate.year, centralDate.month - 1, centralDate.day + i))
    const weekday = weekdayFormatter.format(d)
    const mmdd = `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`
    const text = `${weekday} (${mmdd} @ 8pm Central)`
    answers.push({ poll_media: { text } })
  }

  return answers
}

export function buildPollPayload(baseDate: Date = new Date()) {
  return {
    question: { text: POLL_QUESTION },
    answers: generatePollAnswers(baseDate),
    allow_multiselect: POLL_ALLOW_MULTISELECT,
    duration: POLL_DURATION_HOURS,
    layout_type: 1 as const,
  }
}
