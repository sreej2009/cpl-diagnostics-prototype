import type { CollectionType, PaymentMethod } from '@/types'

export interface BookingDraft {
  collectionType: CollectionType
  addressId: string
  labId: string
  /** Days from today: 0 = today, 1 = tomorrow… */
  dayOffset: number
  slot: string | null
  memberId: string
  referralCode: string
  paymentMethod: PaymentMethod
}

export interface StepProps {
  draft: BookingDraft
  update: (patch: Partial<BookingDraft>) => void
}

export const BOOKING_STEPS = ['Collection', 'Schedule', 'Patient', 'Payment'] as const
