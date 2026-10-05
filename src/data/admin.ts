import { daysAgo, lastMonths } from '@/lib/utils'
import type {
  CollectionType,
  Gender,
  Order,
  OrderItem,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Phlebotomist,
} from '@/types'
import { packageById, testById } from './catalog'
import { doctorProfile } from './doctor'

export const adminUser = { name: 'CPL Admin', subtitle: 'Super Admin' }

/* --------------------------------- Orders --------------------------------- */

function item(id: string): OrderItem {
  const test = testById(id)
  if (test) return { id, name: test.name, kind: 'test', price: test.price }
  const pkg = packageById(id)!
  return { id, name: pkg.name, kind: 'package', price: pkg.price }
}

interface OrderSeed {
  id: string
  patient: [name: string, age: number, gender: Gender, mobile: string]
  items: string[]
  collection: [type: CollectionType, location: string, area: string]
  when: [daysAgo: number, slot: string]
  status: OrderStatus
  payment: [method: PaymentMethod, status: PaymentStatus]
  source: [type: OrderSource, name?: string]
  phlebotomistId?: string
}

const ANNA_NAGAR_LAB = 'CPL Diagnostics — Anna Nagar'

const seeds: OrderSeed[] = [
  { id: 'CPL-24836', patient: ['Karthik Raja', 38, 'Male', '98401 77320'], items: ['p-full'], collection: ['home', '22, 4th Main Road', 'Kilpauk'], when: [0, '9:30 – 10:30 AM'], status: 'placed', payment: ['upi', 'paid'], source: ['app'] },
  { id: 'CPL-24835', patient: ['Shanthi Devi', 61, 'Female', '94441 20986'], items: ['p-diabetes'], collection: ['home', '5/2, Kamaraj Avenue', 'Adyar'], when: [0, '7:30 – 8:30 AM'], status: 'placed', payment: ['cod', 'pending'], source: ['franchise', 'CPL Collection Centre — Velachery'] },
  { id: 'CPL-24833', patient: ['Naveen Chandran', 29, 'Male', '90032 66418'], items: ['t-vitd', 't-b12'], collection: ['home', '18, Lake Area', 'Nungambakkam'], when: [0, '12:00 – 1:00 PM'], status: 'placed', payment: ['card', 'failed'], source: ['app'] },
  { id: 'CPL-24831', patient: ['Lakshmi Venkatesan', 47, 'Female', '98845 22017'], items: ['p-full'], collection: ['home', '9, Bharathi Street', 'Anna Nagar'], when: [0, '6:30 – 7:30 AM'], status: 'assigned', payment: ['upi', 'paid'], source: ['doctor', doctorProfile.name], phlebotomistId: 'ph-1' },
  { id: 'CPL-24829', patient: ['Joseph Antony', 55, 'Male', '98410 39952'], items: ['p-heart'], collection: ['lab', ANNA_NAGAR_LAB, 'Anna Nagar'], when: [0, '8:30 – 9:30 AM'], status: 'collected', payment: ['card', 'paid'], source: ['app'] },
  { id: 'CPL-24826', patient: ['Mohammed Farooq', 52, 'Male', '97910 63340'], items: ['t-hba1c', 't-fbs'], collection: ['home', '31, Mosque Street', 'Triplicane'], when: [0, '3:00 – 4:00 PM'], status: 'placed', payment: ['upi', 'paid'], source: ['doctor', doctorProfile.name] },
  { id: 'CPL-24817', patient: ['Priya Raman', 34, 'Female', '98400 12345'], items: ['p-full'], collection: ['home', '14, 3rd Cross Street', 'Anna Nagar'], when: [0, '7:30 – 8:30 AM'], status: 'collected', payment: ['upi', 'paid'], source: ['app'], phlebotomistId: 'ph-1' },
  { id: 'CPL-24809', patient: ['Divya Ramesh', 31, 'Female', '90031 77420'], items: ['t-thyroid'], collection: ['home', '7, Temple View Flats', 'Mylapore'], when: [1, '7:30 – 8:30 AM'], status: 'testing', payment: ['upi', 'paid'], source: ['doctor', doctorProfile.name], phlebotomistId: 'ph-3' },
  { id: 'CPL-24803', patient: ['Bala Subramaniam', 67, 'Male', '94440 71825'], items: ['p-advanced'], collection: ['lab', 'CPL Collection Centre — T. Nagar', 'T. Nagar'], when: [1, '6:30 – 7:30 AM'], status: 'testing', payment: ['cod', 'paid'], source: ['franchise', 'CPL Collection Centre — T. Nagar'] },
  { id: 'CPL-24798', patient: ['Senthil Murugan', 44, 'Male', '98402 11873'], items: ['p-heart'], collection: ['home', '40, Railway Colony', 'Perambur'], when: [1, '8:30 – 9:30 AM'], status: 'testing', payment: ['card', 'paid'], source: ['doctor', doctorProfile.name], phlebotomistId: 'ph-5' },
  { id: 'CPL-24790', patient: ['Revathi Mohan', 36, 'Female', '99621 40087'], items: ['p-women'], collection: ['home', '12, Sea Breeze Apartments', 'Besant Nagar'], when: [1, '9:30 – 10:30 AM'], status: 'reported', payment: ['upi', 'paid'], source: ['app'], phlebotomistId: 'ph-3' },
  { id: 'CPL-24781', patient: ['Arjun Krishnan', 26, 'Male', '95001 30264'], items: ['t-dengue', 't-cbc'], collection: ['lab', ANNA_NAGAR_LAB, 'Anna Nagar'], when: [2, '5:00 – 6:00 PM'], status: 'reported', payment: ['upi', 'paid'], source: ['app'] },
  { id: 'CPL-24772', patient: ['Saraswathi Iyer', 72, 'Female', '94442 88310'], items: ['t-kft', 't-urine', 't-cbc'], collection: ['home', '3, Brahmin Street', 'West Mambalam'], when: [2, '6:30 – 7:30 AM'], status: 'reported', payment: ['cod', 'paid'], source: ['franchise', 'CPL Collection Centre — T. Nagar'], phlebotomistId: 'ph-2' },
  { id: 'CPL-24765', patient: ['Vignesh Balaji', 33, 'Male', '95000 18834'], items: ['t-lipid', 't-lft'], collection: ['home', '88, IT Corridor Residency', 'Velachery'], when: [2, '7:30 – 8:30 AM'], status: 'cancelled', payment: ['upi', 'refunded'], source: ['app'] },
  { id: 'CPL-24731', patient: ['Anitha Joseph', 41, 'Female', '99400 38126'], items: ['t-vitd', 't-b12'], collection: ['home', '16, Church Road', 'Santhome'], when: [3, '8:30 – 9:30 AM'], status: 'reported', payment: ['card', 'paid'], source: ['doctor', doctorProfile.name], phlebotomistId: 'ph-3' },
  { id: 'CPL-24702', patient: ['Gopal Iyer', 58, 'Male', '98413 90254'], items: ['p-diabetes'], collection: ['lab', 'CPL Collection Centre — Velachery', 'Velachery'], when: [4, '7:30 – 8:30 AM'], status: 'reported', payment: ['cod', 'paid'], source: ['doctor', doctorProfile.name] },
]

export const adminOrders: Order[] = seeds.map((s) => {
  const items = s.items.map(item)
  return {
    id: s.id,
    patient: { name: s.patient[0], age: s.patient[1], gender: s.patient[2], mobile: s.patient[3] },
    items,
    total: items.reduce((sum, i) => sum + i.price, 0),
    collectionType: s.collection[0],
    location: s.collection[1],
    area: s.collection[2],
    date: daysAgo(s.when[0]),
    slot: s.when[1],
    status: s.status,
    payment: { method: s.payment[0], status: s.payment[1] },
    phlebotomistId: s.phlebotomistId,
    source: s.source[0],
    sourceName: s.source[1],
    placedAt: daysAgo(s.when[0] + 1),
  }
})

export const phlebotomists: Phlebotomist[] = [
  { id: 'ph-1', name: 'Suresh Kumar', mobile: '90030 44512', zone: 'Anna Nagar · Kilpauk', status: 'on-job', completedToday: 4 },
  { id: 'ph-2', name: 'Divya Lakshmi', mobile: '90030 44518', zone: 'T. Nagar · West Mambalam', status: 'available', completedToday: 5 },
  { id: 'ph-3', name: 'Manoj Prabhu', mobile: '90030 44523', zone: 'Adyar · Mylapore', status: 'available', completedToday: 3 },
  { id: 'ph-4', name: 'Revathi Selvam', mobile: '90030 44531', zone: 'Velachery · Guindy', status: 'on-job', completedToday: 6 },
  { id: 'ph-5', name: 'Imran Khan', mobile: '90030 44540', zone: 'Nungambakkam · Triplicane', status: 'available', completedToday: 2 },
  { id: 'ph-6', name: 'Ganesh Babu', mobile: '90030 44547', zone: 'Tambaram · Chromepet', status: 'off-duty', completedToday: 0 },
]

/* ------------------------------- Dashboard -------------------------------- */

export const dailyOrders = {
  labels: Array.from({ length: 14 }, (_, i) => daysAgo(13 - i).slice(0, 6)),
  values: [86, 92, 78, 104, 111, 97, 64, 95, 108, 101, 118, 126, 109, 73],
}

export const topTests = [
  { label: 'CPL Full Body Checkup', value: 312 },
  { label: 'Thyroid Profile (T3, T4, TSH)', value: 268 },
  { label: 'HbA1c (Glycated Haemoglobin)', value: 241 },
  { label: 'Lipid Profile', value: 207 },
  { label: 'Complete Blood Count (CBC)', value: 196 },
  { label: 'Vitamin D (25-OH)', value: 154 },
]

/* --------------------------------- Revenue -------------------------------- */

export const revenue = {
  months: lastMonths(12),
  /** Monthly revenue in rupees, oldest first. The last entry is month-to-date. */
  monthly: [1420000, 1385000, 1510000, 1640000, 1590000, 1725000, 1810000, 1780000, 1935000, 2040000, 2180000, 1165000],
  channels: [
    { label: 'Patient App', value: 512000 },
    { label: 'Doctor Referral', value: 386000 },
    { label: 'Franchise', value: 267000 },
  ],
  categories: [
    { label: 'Health Packages', value: 468000 },
    { label: 'Diabetes', value: 182000 },
    { label: 'Thyroid', value: 141000 },
    { label: 'Vitamins', value: 136000 },
    { label: 'Heart', value: 118000 },
    { label: 'Other tests', value: 120000 },
  ],
  collection: [
    { label: 'Home Sample Collection', value: 734000 },
    { label: 'Visit Lab', value: 431000 },
  ],
  ordersMtd: 1318,
}

/* --------------------------------- Doctors -------------------------------- */

export interface ReferringDoctor {
  id: string
  name: string
  speciality: string
  clinic: string
  referralCode: string
  referrals: number
  completed: number
  revenue: number
  status: 'Active' | 'Pending approval'
}

export const referringDoctors: ReferringDoctor[] = [
  { id: 'dr-1', name: doctorProfile.name, speciality: doctorProfile.speciality, clinic: doctorProfile.clinic, referralCode: doctorProfile.referralCode, referrals: 31, completed: 27, revenue: 45600, status: 'Active' },
  { id: 'dr-2', name: 'Dr. Meera Nair', speciality: 'Diabetologist', clinic: 'Nair Diabetes Centre, Kilpauk', referralCode: 'CPL-DRMEE-2284', referrals: 46, completed: 41, revenue: 58300, status: 'Active' },
  { id: 'dr-3', name: 'Dr. Karthik Rajan', speciality: 'Cardiologist', clinic: 'Heartline Clinic, Nungambakkam', referralCode: 'CPL-DRKAR-6130', referrals: 28, completed: 25, revenue: 52900, status: 'Active' },
  { id: 'dr-4', name: 'Dr. Sangeetha Mohan', speciality: 'Gynaecologist', clinic: 'Mohan Women’s Clinic, Adyar', referralCode: 'CPL-DRSAN-7745', referrals: 39, completed: 33, revenue: 71200, status: 'Active' },
  { id: 'dr-5', name: 'Dr. Abdul Rahman', speciality: 'General Physician', clinic: 'Rahman Family Clinic, Triplicane', referralCode: 'CPL-DRABD-3392', referrals: 22, completed: 19, revenue: 24800, status: 'Active' },
  { id: 'dr-6', name: 'Dr. Preethi Shankar', speciality: 'Endocrinologist', clinic: 'Shankar Endocrine Care, T. Nagar', referralCode: 'CPL-DRPRE-9051', referrals: 34, completed: 30, revenue: 49700, status: 'Active' },
  { id: 'dr-7', name: 'Dr. Vivek Anand', speciality: 'Orthopaedician', clinic: 'Anand Bone & Joint, Velachery', referralCode: 'CPL-DRVIV-1876', referrals: 14, completed: 11, revenue: 19400, status: 'Active' },
  { id: 'dr-8', name: 'Dr. Nithya Gopalan', speciality: 'Paediatrician', clinic: 'Little Steps Clinic, Porur', referralCode: '—', referrals: 0, completed: 0, revenue: 0, status: 'Pending approval' },
]

/* ------------------------------- Franchises ------------------------------- */

export interface Franchise {
  id: string
  name: string
  owner: string
  mobile: string
  territory: string
  status: 'Active' | 'Onboarding' | 'Suspended'
  orders: number
  revenue: number
  /** Commission paid to the franchise, as a % of its revenue. */
  commissionRate: number
}

export const franchises: Franchise[] = [
  { id: 'fr-1', name: 'CPL Collection Centre — T. Nagar', owner: 'Ramesh Babu', mobile: '98400 51120', territory: 'T. Nagar, West Mambalam, Saidapet', status: 'Active', orders: 214, revenue: 286400, commissionRate: 20 },
  { id: 'fr-2', name: 'CPL Collection Centre — Velachery', owner: 'Sujatha Narayanan', mobile: '98400 51177', territory: 'Velachery, Guindy, Madipakkam', status: 'Active', orders: 187, revenue: 241900, commissionRate: 20 },
  { id: 'fr-3', name: 'CPL Collection Centre — Tambaram', owner: 'Prakash Raj', mobile: '98400 51203', territory: 'Tambaram, Chromepet, Pallavaram', status: 'Active', orders: 142, revenue: 172300, commissionRate: 22 },
  { id: 'fr-4', name: 'CPL Collection Centre — Porur', owner: 'Hema Malini', mobile: '98400 51246', territory: 'Porur, Valasaravakkam, Ramapuram', status: 'Active', orders: 96, revenue: 118700, commissionRate: 22 },
  { id: 'fr-5', name: 'CPL Collection Centre — Coimbatore', owner: 'Senthil Nathan', mobile: '98400 51298', territory: 'RS Puram, Gandhipuram', status: 'Onboarding', orders: 0, revenue: 0, commissionRate: 25 },
  { id: 'fr-6', name: 'CPL Collection Centre — Madurai', owner: 'Muthu Kumar', mobile: '98400 51315', territory: 'KK Nagar, Anna Nagar (Madurai)', status: 'Suspended', orders: 12, revenue: 13800, commissionRate: 20 },
]

/* -------------------------------- Customers ------------------------------- */

export interface Customer {
  id: string
  name: string
  mobile: string
  area: string
  orders: number
  spent: number
  lastOrder: string
  joined: string
  whatsapp: boolean
}

export const customers: Customer[] = [
  { id: 'cu-1', name: 'Priya Raman', mobile: '98400 12345', area: 'Anna Nagar', orders: 6, spent: 9840, lastOrder: daysAgo(0), joined: daysAgo(560), whatsapp: true },
  { id: 'cu-2', name: 'Karthik Raja', mobile: '98401 77320', area: 'Kilpauk', orders: 2, spent: 3298, lastOrder: daysAgo(0), joined: daysAgo(120), whatsapp: true },
  { id: 'cu-3', name: 'Shanthi Devi', mobile: '94441 20986', area: 'Adyar', orders: 9, spent: 8120, lastOrder: daysAgo(0), joined: daysAgo(710), whatsapp: false },
  { id: 'cu-4', name: 'Lakshmi Venkatesan', mobile: '98845 22017', area: 'Anna Nagar', orders: 3, spent: 5497, lastOrder: daysAgo(0), joined: daysAgo(301), whatsapp: true },
  { id: 'cu-5', name: 'Joseph Antony', mobile: '98410 39952', area: 'Anna Nagar', orders: 4, spent: 6190, lastOrder: daysAgo(0), joined: daysAgo(422), whatsapp: true },
  { id: 'cu-6', name: 'Bala Subramaniam', mobile: '94440 71825', area: 'T. Nagar', orders: 11, spent: 21460, lastOrder: daysAgo(1), joined: daysAgo(840), whatsapp: true },
  { id: 'cu-7', name: 'Revathi Mohan', mobile: '99621 40087', area: 'Besant Nagar', orders: 2, spent: 4598, lastOrder: daysAgo(1), joined: daysAgo(64), whatsapp: true },
  { id: 'cu-8', name: 'Saraswathi Iyer', mobile: '94442 88310', area: 'West Mambalam', orders: 14, spent: 16230, lastOrder: daysAgo(2), joined: daysAgo(930), whatsapp: false },
  { id: 'cu-9', name: 'Arjun Krishnan', mobile: '95001 30264', area: 'Anna Nagar', orders: 1, spent: 948, lastOrder: daysAgo(2), joined: daysAgo(2), whatsapp: true },
  { id: 'cu-10', name: 'Anitha Joseph', mobile: '99400 38126', area: 'Santhome', orders: 5, spent: 7730, lastOrder: daysAgo(3), joined: daysAgo(388), whatsapp: true },
  { id: 'cu-11', name: 'Gopal Iyer', mobile: '98413 90254', area: 'Velachery', orders: 8, spent: 6920, lastOrder: daysAgo(4), joined: daysAgo(655), whatsapp: true },
  { id: 'cu-12', name: 'Vignesh Balaji', mobile: '95000 18834', area: 'Velachery', orders: 3, spent: 2847, lastOrder: daysAgo(14), joined: daysAgo(212), whatsapp: true },
]

/* ------------------------------ Notifications ----------------------------- */

export const audiences = ['All customers', 'Doctors', 'Franchises', 'Phlebotomists'] as const
export const channels = ['App notification', 'WhatsApp', 'Email'] as const

export interface SentNotification {
  id: string
  title: string
  audience: (typeof audiences)[number]
  channel: (typeof channels)[number]
  sentOn: string
  recipients: number
}

export const sentNotifications: SentNotification[] = [
  { id: 'n-1', title: 'Monsoon fever panel now available', audience: 'All customers', channel: 'App notification', sentOn: daysAgo(1), recipients: 8420 },
  { id: 'n-2', title: 'Monthly incentive statements are ready', audience: 'Doctors', channel: 'Email', sentOn: daysAgo(4), recipients: 62 },
  { id: 'n-3', title: 'Updated sample dispatch timings', audience: 'Franchises', channel: 'WhatsApp', sentOn: daysAgo(6), recipients: 5 },
  { id: 'n-4', title: 'Carry spare vacutainers this week', audience: 'Phlebotomists', channel: 'App notification', sentOn: daysAgo(9), recipients: 6 },
]

/** Automatic alerts, one per stage of the order workflow. */
export const automatedAlerts = [
  { id: 'placed', label: 'Order Placed', detail: 'Booking confirmation to the patient', enabled: true },
  { id: 'assigned', label: 'Phlebotomist Assigned', detail: 'Phlebotomist name and visit time to the patient', enabled: true },
  { id: 'collected', label: 'Sample Collected', detail: 'Collection acknowledgement to the patient', enabled: true },
  { id: 'reported', label: 'Report Generated & Sent', detail: 'Report link in the app and on WhatsApp', enabled: true },
  { id: 'referral', label: 'Referral completed', detail: 'Credit alert to the referring doctor', enabled: false },
]

/* --------------------------------- Alerts --------------------------------- */

export type AlertSeverity = 'Urgent' | 'Warning' | 'Info'
export type AlertKind = 'urgent-order' | 'collection-delay' | 'transit-delay' | 'report-delay' | 'info'

/** Prototype alerts. They are static sample data, not real-time notifications. */
export interface AdminAlert {
  id: string
  orderId: string
  kind: AlertKind
  severity: AlertSeverity
  title: string
  summary: string
  time: string
  read: boolean
  /** The order event that makes this alert no longer apply. Info alerts have none. */
  clearsWhen?: 'assigned' | 'collected' | 'at-lab' | 'reported' | 'paid'
  /** Worked out from the order's current state — see AdminContext. */
  resolved?: boolean
}

export const adminAlerts: AdminAlert[] = [
  { id: 'al-1', clearsWhen: 'assigned', orderId: 'CPL-24836', kind: 'urgent-order', severity: 'Urgent', title: 'Urgent order needs a phlebotomist', summary: 'Home collection slot 9:30 – 10:30 AM starts soon and no phlebotomist is assigned.', time: 'Today, 8:55 AM', read: false },
  { id: 'al-2', clearsWhen: 'reported', orderId: 'CPL-24803', kind: 'report-delay', severity: 'Urgent', title: 'Report pending beyond expected time', summary: 'Expected within 24 hrs of collection. The report is 6 hrs overdue.', time: 'Today, 8:30 AM', read: false },
  { id: 'al-3', clearsWhen: 'collected', orderId: 'CPL-24835', kind: 'collection-delay', severity: 'Warning', title: 'Sample collection delayed', summary: 'The 7:30 – 8:30 AM slot has passed and the sample has not been collected.', time: 'Today, 8:45 AM', read: false },
  { id: 'al-4', clearsWhen: 'at-lab', orderId: 'CPL-24817', kind: 'transit-delay', severity: 'Warning', title: 'Sample delayed in reaching the laboratory', summary: 'Collected at 7:55 AM. Not yet received at the lab; expected within 90 minutes.', time: 'Today, 9:40 AM', read: false },
  { id: 'al-5', clearsWhen: 'paid', orderId: 'CPL-24833', kind: 'urgent-order', severity: 'Urgent', title: 'Payment failed before collection', summary: 'Card payment failed for a 12:00 – 1:00 PM home collection. Confirm with the patient.', time: 'Today, 9:05 AM', read: false },
  { id: 'al-6', clearsWhen: 'reported', orderId: 'CPL-24809', kind: 'report-delay', severity: 'Warning', title: 'Report close to its expected time', summary: 'Thyroid Profile is due within the next 2 hrs and is still in testing.', time: 'Today, 7:50 AM', read: true },
  { id: 'al-7', orderId: 'CPL-24831', kind: 'info', severity: 'Info', title: 'Phlebotomist assigned', summary: 'Suresh Kumar accepted the 6:30 – 7:30 AM home collection.', time: 'Yesterday, 7:15 PM', read: true },
  { id: 'al-8', orderId: 'CPL-24790', kind: 'info', severity: 'Info', title: 'Report released', summary: "Women's Wellness Package report was released and sent on WhatsApp.", time: 'Yesterday, 6:20 PM', read: true },
]
