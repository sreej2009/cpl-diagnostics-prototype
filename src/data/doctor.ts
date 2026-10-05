import { daysAgo, lastMonths, monthYear } from '@/lib/utils'
import type { OrderStatus, ReportResult } from '@/types'
import { initialReports } from './patient'

export const doctorProfile = {
  name: 'Dr. Arvind Subramanian',
  qualification: 'MBBS, MD (General Medicine)',
  speciality: 'General Physician',
  clinic: 'Subramanian Clinic, Anna Nagar',
  registrationNo: 'TNMC 78542',
  mobile: '98410 55210',
  referralCode: 'CPL-DRARV-4821',
  /** Incentive earned on each completed referral, as a % of order value. */
  commissionRate: 15,
}

export type ReferralChannel = 'Referral code' | 'Prescription' | 'Recommendation'

export interface Referral {
  id: string
  patient: string
  mobile: string
  date: string
  tests: string
  orderId: string
  orderValue: number
  status: OrderStatus
  channel: ReferralChannel
}

const rate = doctorProfile.commissionRate / 100
export const commissionOn = (orderValue: number) => Math.round(orderValue * rate)

export const referrals: Referral[] = [
  { id: 'rf-1', patient: 'Lakshmi Venkatesan', mobile: '98845 22017', date: daysAgo(0), tests: 'CPL Full Body Checkup', orderId: 'CPL-24831', orderValue: 1999, status: 'assigned', channel: 'Recommendation' },
  { id: 'rf-2', patient: 'Mohammed Farooq', mobile: '97910 63340', date: daysAgo(0), tests: 'HbA1c, Fasting Blood Sugar', orderId: 'CPL-24826', orderValue: 548, status: 'placed', channel: 'Referral code' },
  { id: 'rf-3', patient: 'Divya Ramesh', mobile: '90031 77420', date: daysAgo(1), tests: 'Thyroid Profile (T3, T4, TSH)', orderId: 'CPL-24809', orderValue: 499, status: 'testing', channel: 'Prescription' },
  { id: 'rf-4', patient: 'Senthil Murugan', mobile: '98402 11873', date: daysAgo(1), tests: 'Healthy Heart Package', orderId: 'CPL-24798', orderValue: 1299, status: 'collected', channel: 'Referral code' },
  { id: 'rf-5', patient: 'Anitha Joseph', mobile: '99400 38126', date: daysAgo(3), tests: 'Vitamin D (25-OH), Vitamin B12', orderId: 'CPL-24731', orderValue: 2098, status: 'reported', channel: 'Recommendation' },
  { id: 'rf-6', patient: 'Gopal Iyer', mobile: '98413 90254', date: daysAgo(4), tests: 'Diabetes Care Package', orderId: 'CPL-24702', orderValue: 799, status: 'reported', channel: 'Referral code' },
  { id: 'rf-7', patient: 'Fathima Begum', mobile: '96770 41288', date: daysAgo(6), tests: 'Complete Blood Count (CBC), Iron Studies', orderId: 'CPL-24655', orderValue: 1048, status: 'reported', channel: 'Prescription' },
  { id: 'rf-8', patient: 'Rajesh Kannan', mobile: '98840 76012', date: daysAgo(9), tests: 'Lipid Profile, Liver Function Test (LFT)', orderId: 'CPL-24580', orderValue: 1148, status: 'reported', channel: 'Referral code' },
  { id: 'rf-9', patient: 'Kavitha Sundaram', mobile: '90030 52291', date: daysAgo(12), tests: 'CPL Advanced Full Body + Vitamins', orderId: 'CPL-24493', orderValue: 2999, status: 'reported', channel: 'Recommendation' },
  { id: 'rf-10', patient: 'Vignesh Balaji', mobile: '95000 18834', date: daysAgo(14), tests: 'Dengue NS1 Antigen, CBC', orderId: 'CPL-24421', orderValue: 948, status: 'cancelled', channel: 'Referral code' },
  { id: 'rf-11', patient: 'Priya Raman', mobile: '98400 12345', date: daysAgo(21), tests: 'Lipid Profile, HbA1c', orderId: 'CPL-24102', orderValue: 998, status: 'reported', channel: 'Referral code' },
  { id: 'rf-12', patient: 'Subramani Pillai', mobile: '94440 60917', date: daysAgo(24), tests: 'Kidney Function Test (KFT), Urine Routine', orderId: 'CPL-24015', orderValue: 798, status: 'reported', channel: 'Prescription' },
]

export interface Prescription {
  id: string
  patient: string
  mobile: string
  fileName: string
  notes: string
  uploadedOn: string
  status: 'Received' | 'Patient contacted' | 'Order booked'
}

export const prescriptions: Prescription[] = [
  { id: 'rx-1', patient: 'Divya Ramesh', mobile: '90031 77420', fileName: 'rx-divya-ramesh.jpg', notes: 'Thyroid profile, repeat in 6 weeks', uploadedOn: daysAgo(1), status: 'Order booked' },
  { id: 'rx-2', patient: 'Harish Narayanan', mobile: '98847 30095', fileName: 'prescription-harish.pdf', notes: 'Fasting lipid profile and LFT', uploadedOn: daysAgo(2), status: 'Patient contacted' },
  { id: 'rx-3', patient: 'Fathima Begum', mobile: '96770 41288', fileName: 'rx-fathima.jpg', notes: 'CBC and iron studies', uploadedOn: daysAgo(6), status: 'Order booked' },
  { id: 'rx-4', patient: 'Subramani Pillai', mobile: '94440 60917', fileName: 'rx-subramani.pdf', notes: 'KFT, urine routine', uploadedOn: daysAgo(24), status: 'Order booked' },
]

export interface Recommendation {
  id: string
  patient: string
  mobile: string
  items: string[]
  note: string
  sentOn: string
  status: 'Sent' | 'Viewed' | 'Booked'
}

export const recommendations: Recommendation[] = [
  { id: 'rc-1', patient: 'Lakshmi Venkatesan', mobile: '98845 22017', items: ['CPL Full Body Checkup'], note: 'Annual review. Come fasting.', sentOn: daysAgo(1), status: 'Booked' },
  { id: 'rc-2', patient: 'Arun Prakash', mobile: '99622 40718', items: ['HbA1c (Glycated Haemoglobin)', 'Kidney Function Test (KFT)'], note: 'Quarterly diabetes follow-up.', sentOn: daysAgo(2), status: 'Viewed' },
  { id: 'rc-3', patient: 'Anitha Joseph', mobile: '99400 38126', items: ['Vitamin D (25-OH)', 'Vitamin B12'], note: '', sentOn: daysAgo(4), status: 'Booked' },
  { id: 'rc-4', patient: 'Meenakshi Sundar', mobile: '98410 27763', items: ['Thyroid Profile (T3, T4, TSH)'], note: 'Review dosage after results.', sentOn: daysAgo(5), status: 'Sent' },
]

export type ConsentStatus = 'granted' | 'pending' | 'none'

export interface PatientReportAccess {
  id: string
  patient: string
  patientMeta: string
  title: string
  reportedOn: string
  consent: ConsentStatus
  results: ReportResult[]
}

const lipidReport = initialReports[0]

export const patientReports: PatientReportAccess[] = [
  {
    id: 'pr-1',
    patient: lipidReport.patientName,
    patientMeta: lipidReport.patientMeta,
    title: lipidReport.title,
    reportedOn: lipidReport.reportedOn,
    consent: 'granted',
    results: lipidReport.results,
  },
  {
    id: 'pr-2',
    patient: 'Anitha Joseph',
    patientMeta: '41 yrs · Female',
    title: 'Vitamin D & Vitamin B12',
    reportedOn: daysAgo(2),
    consent: 'granted',
    results: [
      { group: 'Vitamins', name: 'Vitamin D (25-OH)', value: 14.2, unit: 'ng/mL', low: 30, high: 100, flag: 'low' },
      { group: 'Vitamins', name: 'Vitamin B12', value: 268, unit: 'pg/mL', low: 211, high: 911, flag: 'normal' },
    ],
  },
  {
    id: 'pr-3',
    patient: 'Gopal Iyer',
    patientMeta: '58 yrs · Male',
    title: 'Diabetes Care Package',
    reportedOn: daysAgo(3),
    consent: 'pending',
    results: [],
  },
  {
    id: 'pr-4',
    patient: 'Fathima Begum',
    patientMeta: '29 yrs · Female',
    title: 'CBC & Iron Studies',
    reportedOn: daysAgo(5),
    consent: 'granted',
    results: [
      { group: 'Complete Blood Count', name: 'Haemoglobin', value: 10.2, unit: 'g/dL', low: 12, high: 15.5, flag: 'low' },
      { group: 'Complete Blood Count', name: 'MCV', value: 76, unit: 'fL', low: 83, high: 101, flag: 'low' },
      { group: 'Iron Studies', name: 'Serum Ferritin', value: 9, unit: 'ng/mL', low: 13, high: 150, flag: 'low' },
      { group: 'Iron Studies', name: 'Serum Iron', value: 42, unit: 'µg/dL', low: 50, high: 170, flag: 'low' },
    ],
  },
  {
    id: 'pr-5',
    patient: 'Rajesh Kannan',
    patientMeta: '46 yrs · Male',
    title: 'Lipid Profile & LFT',
    reportedOn: daysAgo(8),
    consent: 'none',
    results: [],
  },
  {
    id: 'pr-6',
    patient: 'Kavitha Sundaram',
    patientMeta: '52 yrs · Female',
    title: 'CPL Advanced Full Body + Vitamins',
    reportedOn: daysAgo(11),
    consent: 'none',
    results: [],
  },
]

/** Last six months, oldest first. */
export const earningsHistory = {
  months: lastMonths(6),
  earnings: [8420, 9760, 11240, 10380, 12910, 6840],
  referrals: [38, 44, 51, 47, 58, 31],
}

export interface Payout {
  id: string
  period: string
  amount: number
  status: 'Paid' | 'Processing'
  paidOn: string
  reference: string
}

export const payouts: Payout[] = [
  { id: 'po-1', period: monthYear(1), amount: 12910, status: 'Processing', paidOn: '—', reference: '—' },
  { id: 'po-2', period: monthYear(2), amount: 10380, status: 'Paid', paidOn: daysAgo(34), reference: 'UTR 4092817365' },
  { id: 'po-3', period: monthYear(3), amount: 11240, status: 'Paid', paidOn: daysAgo(64), reference: 'UTR 3981120574' },
  { id: 'po-4', period: monthYear(4), amount: 9760, status: 'Paid', paidOn: daysAgo(95), reference: 'UTR 3870046291' },
  { id: 'po-5', period: monthYear(5), amount: 8420, status: 'Paid', paidOn: daysAgo(126), reference: 'UTR 3764419802' },
]

export interface MonthlyReport {
  period: string
  referrals: number
  completed: number
  orderValue: number
  commission: number
  categories: { label: string; value: number }[]
  channels: { label: string; value: number }[]
}

function buildMonthlyReport(offset: number, referralCount: number, orderValue: number): MonthlyReport {
  const completed = Math.round(referralCount * 0.86)
  const byCode = Math.round(referralCount * 0.52)
  const byRecommendation = Math.round(referralCount * 0.3)
  return {
    period: monthYear(offset),
    referrals: referralCount,
    completed,
    orderValue,
    commission: commissionOn(orderValue),
    categories: [
      { label: 'Health Packages', value: Math.round(referralCount * 0.3) },
      { label: 'Diabetes', value: Math.round(referralCount * 0.24) },
      { label: 'Thyroid', value: Math.round(referralCount * 0.17) },
      { label: 'Heart', value: Math.round(referralCount * 0.13) },
      { label: 'Vitamins', value: Math.round(referralCount * 0.1) },
      { label: 'Other tests', value: Math.round(referralCount * 0.06) },
    ],
    channels: [
      { label: 'Referral code', value: byCode },
      { label: 'Recommendation', value: byRecommendation },
      { label: 'Prescription', value: referralCount - byCode - byRecommendation },
    ],
  }
}

/** Most recent month first. */
export const monthlyReports: MonthlyReport[] = [
  buildMonthlyReport(0, 31, 45600),
  buildMonthlyReport(1, 58, 86067),
  buildMonthlyReport(2, 47, 69200),
  buildMonthlyReport(3, 51, 74930),
  buildMonthlyReport(4, 44, 65067),
  buildMonthlyReport(5, 38, 56130),
]

/** Patients the doctor has referred, grouped from the referral list. */
export interface DoctorPatient {
  id: string
  name: string
  mobile: string
  referrals: Referral[]
  lastReferred: string
}

export const doctorPatients: DoctorPatient[] = referrals.reduce<DoctorPatient[]>((list, referral) => {
  const existing = list.find((p) => p.mobile === referral.mobile)
  if (existing) existing.referrals.push(referral)
  else
    list.push({
      id: referral.mobile.replace(/\s/g, ''),
      name: referral.patient,
      mobile: referral.mobile,
      referrals: [referral],
      lastReferred: referral.date,
    })
  return list
}, [])

/** "05 Oct 2026" → "Oct 2026" — the payout period a referral falls into. */
export const referralPeriod = (referral: Referral) => referral.date.slice(3)

export type CommissionStatus = 'Paid' | 'Processing' | 'Pending payout' | 'Awaiting completion' | 'Not applicable'

/** Where the incentive for a referral stands, derived from the order status and that month's payout. */
export function commissionStatus(referral: Referral): CommissionStatus {
  if (referral.status === 'cancelled') return 'Not applicable'
  if (referral.status !== 'reported') return 'Awaiting completion'
  const payout = payouts.find((p) => p.period === referralPeriod(referral))
  if (!payout) return 'Pending payout'
  return payout.status === 'Paid' ? 'Paid' : 'Processing'
}
