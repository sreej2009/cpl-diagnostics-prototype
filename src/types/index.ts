export type TestCategory =
  | 'Diabetes'
  | 'Thyroid'
  | 'Heart'
  | 'Liver'
  | 'Kidney'
  | 'Vitamins'
  | 'Blood'
  | 'Fever'

export interface LabTest {
  id: string
  name: string
  category: TestCategory
  price: number
  mrp: number
  sampleType: string
  /** Fasting requirement, e.g. "10–12 hrs". null = no fasting needed. */
  fasting: string | null
  reportTime: string
  parameters: number
  popular?: boolean
  active: boolean
  description: string
}

export interface HealthPackage {
  id: string
  name: string
  tagline: string
  price: number
  mrp: number
  testIds: string[]
  parameters: number
  idealFor: string
  reportTime: string
  fasting: string | null
  popular?: boolean
  active: boolean
}

export type Gender = 'Male' | 'Female' | 'Other'
export type CollectionType = 'home' | 'lab'
export type PaymentMethod = 'upi' | 'card' | 'cod'
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'

/** Mirrors the "Automated Workflow" on page 4 of the layout plan. */
export type OrderStatus = 'placed' | 'assigned' | 'collected' | 'testing' | 'reported' | 'cancelled'

export type OrderSource = 'app' | 'doctor' | 'franchise'

export interface OrderItem {
  id: string
  name: string
  kind: 'test' | 'package'
  price: number
}

export interface Order {
  id: string
  patient: { name: string; age: number; gender: Gender; mobile: string }
  items: OrderItem[]
  total: number
  collectionType: CollectionType
  /** Home address, or the lab / collection centre name. */
  location: string
  area: string
  date: string
  slot: string
  status: OrderStatus
  payment: { method: PaymentMethod; status: PaymentStatus }
  phlebotomistId?: string
  source: OrderSource
  sourceName?: string
  placedAt: string
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
  age: number
  gender: Gender
  mobile: string
}

export interface Address {
  id: string
  label: string
  line: string
  area: string
}

export interface LabCentre {
  id: string
  name: string
  address: string
  distance: string
  hours: string
  mainLab?: boolean
}

export type ResultFlag = 'normal' | 'high' | 'low'

export interface ReportResult {
  group: string
  name: string
  value: number
  unit: string
  low: number | null
  high: number | null
  flag: ResultFlag
}

export interface LabReport {
  id: string
  orderId: string
  title: string
  patientName: string
  patientMeta: string
  collectedOn: string
  reportedOn: string
  results: ReportResult[]
  sharedWith: string[]
  whatsappSent: boolean
}

export interface HealthMetric {
  id: string
  name: string
  unit: string
  low: number | null
  high: number | null
  rangeLabel: string
  readings: { date: string; value: number }[]
}

export interface DoctorContact {
  id: string
  name: string
  speciality: string
  clinic: string
}

export interface Phlebotomist {
  id: string
  name: string
  mobile: string
  zone: string
  status: 'available' | 'on-job' | 'off-duty'
  completedToday: number
}
