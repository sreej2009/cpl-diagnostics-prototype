export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

/** ₹4.82L / ₹38.4k — for dashboard tiles and axis ticks. */
export function compactInr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.00$/, '')}L`
  if (n >= 1000) return `₹${Number((n / 1000).toFixed(1))}k`
  return inr(n)
}

export const pctOff = (price: number, mrp: number) => Math.round((1 - price / mrp) * 100)

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function addDays(n: number, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + n)
  return d
}

/** 05 Oct 2026 */
export function fmtDate(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Mock data is dated relative to today so the demo never looks stale. */
export const daysAgo = (n: number) => fmtDate(addDays(-n))

export const dayName = (d: Date) => DAYS[d.getDay()]
export const monthName = (d: Date) => MONTHS[d.getMonth()]

/** Labels for the last `count` months, oldest first, e.g. ["May", …, "Oct"]. */
export function lastMonths(count: number) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
    return MONTHS[d.getMonth()]
  })
}

export function monthYear(offset = 0) {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
