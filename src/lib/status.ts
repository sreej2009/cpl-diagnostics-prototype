import type { BadgeTone } from '@/components/ui/Badge'
import type { CollectionType, OrderSource, OrderStatus, PaymentMethod, PaymentStatus } from '@/types'

/** The five workflow stages from the layout plan (page 4, "Automated Workflow"). */
export const ORDER_STEPS: { key: OrderStatus; label: string; hint: string }[] = [
  { key: 'placed', label: 'Order Placed', hint: 'We have received your booking' },
  { key: 'assigned', label: 'Phlebotomist Assigned', hint: 'A phlebotomist is assigned to your order' },
  { key: 'collected', label: 'Sample Collected', hint: 'Your sample is on its way to the lab' },
  { key: 'testing', label: 'Lab Testing', hint: 'Your sample is being processed' },
  { key: 'reported', label: 'Report Generated & Sent', hint: 'Available in the app and on WhatsApp' },
]

/** Lab visits have no phlebotomist step. */
export function stepsFor(collectionType: CollectionType) {
  return collectionType === 'lab' ? ORDER_STEPS.filter((s) => s.key !== 'assigned') : ORDER_STEPS
}

export const statusLabel: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  assigned: 'Phlebotomist Assigned',
  collected: 'Sample Collected',
  testing: 'Lab Testing',
  reported: 'Report Sent',
  cancelled: 'Cancelled',
}

export const statusTone: Record<OrderStatus, BadgeTone> = {
  placed: 'amber',
  assigned: 'brand',
  collected: 'brand',
  testing: 'teal',
  reported: 'green',
  cancelled: 'red',
}

export const isActive = (s: OrderStatus) => s !== 'reported' && s !== 'cancelled'

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  cod: 'COD',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const paymentStatusTone: Record<PaymentStatus, BadgeTone> = {
  paid: 'green',
  pending: 'amber',
  failed: 'red',
  refunded: 'neutral',
}

export const collectionLabel: Record<CollectionType, string> = {
  home: 'Home Sample Collection',
  lab: 'Visit Lab',
}

export const sourceLabel: Record<OrderSource, string> = {
  app: 'Patient App',
  doctor: 'Doctor Referral',
  franchise: 'Franchise',
}
