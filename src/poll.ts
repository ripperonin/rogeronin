export const POLL_QUESTION = 'Baldurs Gate 3 next sesh'
export const POLL_DURATION_HOURS = 72
export const POLL_ALLOW_MULTISELECT = true

const TIME_ZONE = 'America/Chicago'

/**
 * Generates 7 poll answer strings starting tomorrow.
 * Format: "Monday (MM/DD @ 8pm Central)"
 * @param baseDate - base date to calculate from, defaults to now
 */
export function generatePollAnswers(baseDate: Date = new Date()): { poll_media: { text: string } }[] {
  const answers: { poll_media: { text: string } }[] = []

  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: TIME_ZONE,
  })

  const mmddFormatter = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
  })

  for (let i = 1; i <= 7; i++) {
    const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
    const weekday = weekdayFormatter.format(d)
    const mmdd = mmddFormatter.format(d)
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
