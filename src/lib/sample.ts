import type { CollectionType, Order, OrderStatus } from '@/types'

/** The six-stage sample lifecycle shown in the Admin App and (simplified) in the Patient App. */
export const SAMPLE_STAGES = [
  { key: 'placed', label: 'Order placed', short: 'Order placed' },
  { key: 'assigned', label: 'Collection assigned', short: 'Assigned' },
  { key: 'collected', label: 'Sample collected', short: 'Collected' },
  { key: 'received', label: 'Sample received at laboratory', short: 'Received at lab' },
  { key: 'processing', label: 'Processing', short: 'Processing' },
  { key: 'ready', label: 'Report ready', short: 'Report ready' },
] as const

export type SampleStage = (typeof SAMPLE_STAGES)[number]['key']

/** Lab visits have no collection-assignment stage. */
export function sampleStagesFor(collectionType: CollectionType) {
  return collectionType === 'lab' ? SAMPLE_STAGES.filter((s) => s.key !== 'assigned') : [...SAMPLE_STAGES]
}

/** The order workflow has five statuses; "received at laboratory" sits between collected and testing. */
export function stageFromStatus(status: OrderStatus): SampleStage | null {
  switch (status) {
    case 'placed':
      return 'placed'
    case 'assigned':
      return 'assigned'
    case 'collected':
      return 'collected'
    case 'testing':
      return 'processing'
    case 'reported':
      return 'ready'
    default:
      return null
  }
}

export const statusForStage: Record<SampleStage, OrderStatus> = {
  placed: 'placed',
  assigned: 'assigned',
  collected: 'collected',
  received: 'collected',
  processing: 'testing',
  ready: 'reported',
}

/** Mock sample barcode derived from the order ID, e.g. CPL-24817 → SMP-24817-4. */
export function sampleBarcode(orderId: string) {
  const digits = orderId.replace(/\D/g, '')
  const check = [...digits].reduce((sum, d, i) => sum + Number(d) * (i + 1), 0) % 10
  return `SMP-${digits}-${check}`
}

function clock(minutes: number) {
  const m = Math.min(Math.max(minutes, 0), 23 * 60 + 30)
  const h24 = Math.floor(m / 60)
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

/** "7:30 – 8:30 AM" → minutes since midnight of the slot start. */
function slotStart(slot: string) {
  const [start] = slot.split(' – ')
  const [h, min] = start.split(':').map(Number)
  // the booking slots are one hour long and never cross noon, so the start shares the AM/PM of the end
  const hour = slot.trim().endsWith('PM') && h !== 12 ? h + 12 : h
  return hour * 60 + (min || 0)
}

/**
 * Mock timestamps for the stages a sample has already passed. They are generated
 * from the booking slot so they look plausible — nothing here is recorded live.
 */
export function stageTimestamps(order: Order, current: SampleStage): Partial<Record<SampleStage, string>> {
  const reached = SAMPLE_STAGES.findIndex((s) => s.key === current)
  const collectedAt = slotStart(order.slot) + 25
  const all: Record<SampleStage, string> = {
    placed: `${order.placedAt}, 6:42 PM`,
    assigned: `${order.placedAt}, 7:15 PM`,
    collected: `${order.date}, ${clock(collectedAt)}`,
    received: `${order.date}, ${clock(collectedAt + 85)}`,
    processing: `${order.date}, ${clock(collectedAt + 130)}`,
    ready: `${order.date}, ${clock(collectedAt + 520)}`,
  }
  return Object.fromEntries(SAMPLE_STAGES.filter((_, i) => i <= reached).map((s) => [s.key, all[s.key]]))
}
