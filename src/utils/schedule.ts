/**
 * Date and time formatting for the partner screens.
 *
 * Every list in the design puts a day word over a clock time — "Today" above
 * "09:30 AM", "Wednesday" above "12:00 PM" — and the detail screens put the
 * two on one line. That is one rule, so it lives in one place rather than being
 * re-derived per screen with `toLocaleString`.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Whole days from today: 0 today, 1 tomorrow, -1 yesterday. */
export function daysFromToday(iso: string | Date): number {
  const target = startOfDay(new Date(iso))
  return Math.round((target.getTime() - startOfDay(new Date()).getTime()) / MS_PER_DAY)
}

/**
 * "Today", "Tomorrow", then the weekday for the rest of this week, then a date.
 *
 * The design shows "Wednesday" for a booking two days out and "Tomorrow" for
 * one day out, so the weekday only starts at day two — otherwise tomorrow would
 * read as its own weekday name and the two labels would compete.
 */
export function dayLabel(iso: string | Date): string {
  const offset = daysFromToday(iso)
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  if (offset === -1) return 'Yesterday'
  const date = new Date(iso)
  if (offset > 1 && offset < 7) {
    return date.toLocaleDateString('en-IN', { weekday: 'long' })
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** "09:30 AM" — two-digit hour, as every row in the design shows it. */
export function timeLabel(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** "Tomorrow 28 July • 9:00AM", the detail screens' one-line form. */
export function slotLabel(iso: string | Date): string {
  const date = new Date(iso)
  const day = dayLabel(date)
  const dayMonth = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
  return `${day} ${dayMonth} • ${timeLabel(date)}`
}

/**
 * "starts in 02:32hrs", or null once it has started.
 *
 * Null rather than "00:00hrs" because the screens swap the whole line for a
 * live status when the wait is over — a countdown that has reached zero is not
 * the same thing as one still running.
 */
export function countdownLabel(iso: string | Date, suffix = 'starts in'): string | null {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return null
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (hours > 0) return `${suffix} ${pad(hours)}:${pad(minutes)}hrs`
  return `${suffix} ${pad(minutes)}mins`
}

/** "28 y • Female" — drops whichever half is missing rather than showing a gap. */
export function patientMeta(age?: number | null, gender?: string): string {
  const parts: string[] = []
  if (age != null) parts.push(`${age} y`)
  if (gender) parts.push(gender.charAt(0).toUpperCase() + gender.slice(1))
  return parts.join(' • ')
}

/** The short form the dense list rows use: "23 y • M". */
export function patientMetaShort(age?: number | null, gender?: string): string {
  const parts: string[] = []
  if (age != null) parts.push(`${age} y`)
  if (gender) parts.push(gender.charAt(0).toUpperCase())
  return parts.join(' • ')
}

/**
 * Groups rows into the "Today" / "Last week" / "Other" cards the notifications
 * screen is built from — looking backwards, where the index screens look
 * forwards. Empty groups are dropped so a quiet week does not leave a heading
 * over nothing.
 */
export function groupByRecency<T>(rows: T[], getDate: (row: T) => string): { label: string; rows: T[] }[] {
  const order = ['Today', 'Last week', 'Other']
  const groups = new Map<string, T[]>(order.map((label) => [label, []]))
  for (const row of rows) {
    const offset = daysFromToday(getDate(row))
    const label = offset === 0 ? 'Today' : offset > -7 ? 'Last week' : 'Other'
    groups.get(label)!.push(row)
  }
  return order
    .map((label) => ({ label, rows: groups.get(label)! }))
    .filter((group) => group.rows.length > 0)
}

/** Groups rows into the day cards the index screens are built from. */
export function groupByDay<T>(rows: T[], getDate: (row: T) => string | null): { label: string; rows: T[] }[] {
  const groups = new Map<string, { label: string; order: number; rows: T[] }>()
  for (const row of rows) {
    const date = getDate(row)
    if (!date) continue
    const offset = daysFromToday(date)
    const key = String(offset)
    if (!groups.has(key)) groups.set(key, { label: dayLabel(date), order: offset, rows: [] })
    groups.get(key)!.rows.push(row)
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map(({ label, rows }) => ({ label, rows }))
}
