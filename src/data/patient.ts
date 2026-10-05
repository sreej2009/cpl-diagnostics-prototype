import { addDays, daysAgo, fmtDate } from '@/lib/utils'
import type { Address, DoctorContact, FamilyMember, HealthMetric, LabCentre, LabReport, Order } from '@/types'

export const defaultUser = { name: 'Priya Raman', mobile: '98400 12345' }

export const familyMembers: FamilyMember[] = [
  { id: 'm-1', name: 'Priya Raman', relation: 'Self', age: 34, gender: 'Female', mobile: '98400 12345' },
  { id: 'm-2', name: 'Raman Krishnan', relation: 'Father', age: 63, gender: 'Male', mobile: '98400 67890' },
  { id: 'm-3', name: 'Aarav Raman', relation: 'Son', age: 8, gender: 'Male', mobile: '98400 12345' },
]

export const addresses: Address[] = [
  { id: 'a-1', label: 'Home', line: '14, 3rd Cross Street, Anna Nagar West', area: 'Anna Nagar, Chennai 600040' },
  { id: 'a-2', label: 'Parents', line: '7B, Lake View Apartments, Gandhi Nagar', area: 'Adyar, Chennai 600020' },
]

export const labCentres: LabCentre[] = [
  {
    id: 'l-1',
    name: 'CPL Diagnostics — Anna Nagar',
    address: '2nd Avenue, Anna Nagar, Chennai 600040',
    distance: '1.2 km',
    hours: '6:30 AM – 8:30 PM',
    mainLab: true,
  },
  {
    id: 'l-2',
    name: 'CPL Collection Centre — T. Nagar',
    address: 'Usman Road, T. Nagar, Chennai 600017',
    distance: '5.4 km',
    hours: '7:00 AM – 7:00 PM',
  },
  {
    id: 'l-3',
    name: 'CPL Collection Centre — Velachery',
    address: '100 Feet Bypass Road, Velachery, Chennai 600042',
    distance: '11.8 km',
    hours: '7:00 AM – 7:00 PM',
  },
]

export const timeSlots = [
  { period: 'Morning', slots: ['6:30 – 7:30 AM', '7:30 – 8:30 AM', '8:30 – 9:30 AM', '9:30 – 10:30 AM'] },
  { period: 'Afternoon', slots: ['12:00 – 1:00 PM', '2:00 – 3:00 PM', '3:00 – 4:00 PM'] },
  { period: 'Evening', slots: ['5:00 – 6:00 PM', '6:00 – 7:00 PM'] },
]

/** Slots shown as fully booked in the demo. */
export const unavailableSlots = ['8:30 – 9:30 AM', '2:00 – 3:00 PM']

export const myDoctors: DoctorContact[] = [
  { id: 'd-1', name: 'Dr. Arvind Subramanian', speciality: 'General Physician', clinic: 'Subramanian Clinic, Anna Nagar' },
  { id: 'd-2', name: 'Dr. Meera Nair', speciality: 'Diabetologist', clinic: 'Nair Diabetes Centre, Kilpauk' },
  { id: 'd-3', name: 'Dr. Karthik Rajan', speciality: 'Cardiologist', clinic: 'Heartline Clinic, Nungambakkam' },
]

export const assignedPhlebotomist = { name: 'Suresh Kumar', mobile: '90030 44512' }

export const initialOrders: Order[] = [
  {
    id: 'CPL-24817',
    patient: { name: 'Priya Raman', age: 34, gender: 'Female', mobile: '98400 12345' },
    items: [{ id: 'p-full', name: 'CPL Full Body Checkup', kind: 'package', price: 1999 }],
    total: 1999,
    collectionType: 'home',
    location: '14, 3rd Cross Street, Anna Nagar West',
    area: 'Anna Nagar, Chennai 600040',
    date: daysAgo(0),
    slot: '7:30 – 8:30 AM',
    status: 'collected',
    payment: { method: 'upi', status: 'paid' },
    phlebotomistId: 'ph-1',
    source: 'app',
    placedAt: daysAgo(1),
  },
  {
    id: 'CPL-24102',
    patient: { name: 'Priya Raman', age: 34, gender: 'Female', mobile: '98400 12345' },
    items: [
      { id: 't-lipid', name: 'Lipid Profile', kind: 'test', price: 549 },
      { id: 't-hba1c', name: 'HbA1c (Glycated Haemoglobin)', kind: 'test', price: 449 },
    ],
    total: 998,
    collectionType: 'home',
    location: '14, 3rd Cross Street, Anna Nagar West',
    area: 'Anna Nagar, Chennai 600040',
    date: daysAgo(21),
    slot: '6:30 – 7:30 AM',
    status: 'reported',
    payment: { method: 'card', status: 'paid' },
    phlebotomistId: 'ph-2',
    source: 'doctor',
    sourceName: 'Dr. Arvind Subramanian',
    placedAt: daysAgo(22),
  },
  {
    id: 'CPL-22764',
    patient: { name: 'Raman Krishnan', age: 63, gender: 'Male', mobile: '98400 67890' },
    items: [
      { id: 't-thyroid', name: 'Thyroid Profile (T3, T4, TSH)', kind: 'test', price: 499 },
      { id: 't-vitd', name: 'Vitamin D (25-OH)', kind: 'test', price: 1199 },
    ],
    total: 1698,
    collectionType: 'lab',
    location: 'CPL Diagnostics — Anna Nagar',
    area: '2nd Avenue, Anna Nagar, Chennai 600040',
    date: daysAgo(96),
    slot: '9:30 – 10:30 AM',
    status: 'reported',
    payment: { method: 'cod', status: 'paid' },
    source: 'app',
    placedAt: daysAgo(97),
  },
]

export const initialReports: LabReport[] = [
  {
    id: 'r-1',
    orderId: 'CPL-24102',
    title: 'Lipid Profile & HbA1c',
    patientName: 'Priya Raman',
    patientMeta: '34 yrs · Female',
    collectedOn: daysAgo(21),
    reportedOn: daysAgo(20),
    sharedWith: ['Dr. Arvind Subramanian'],
    whatsappSent: true,
    results: [
      { group: 'Lipid Profile', name: 'Total Cholesterol', value: 212, unit: 'mg/dL', low: null, high: 200, flag: 'high' },
      { group: 'Lipid Profile', name: 'HDL Cholesterol', value: 52, unit: 'mg/dL', low: 40, high: null, flag: 'normal' },
      { group: 'Lipid Profile', name: 'LDL Cholesterol', value: 138, unit: 'mg/dL', low: null, high: 130, flag: 'high' },
      { group: 'Lipid Profile', name: 'Triglycerides', value: 128, unit: 'mg/dL', low: null, high: 150, flag: 'normal' },
      { group: 'Lipid Profile', name: 'VLDL Cholesterol', value: 26, unit: 'mg/dL', low: null, high: 30, flag: 'normal' },
      { group: 'Diabetes', name: 'HbA1c', value: 5.6, unit: '%', low: null, high: 5.7, flag: 'normal' },
      { group: 'Diabetes', name: 'Estimated Average Glucose', value: 114, unit: 'mg/dL', low: null, high: 117, flag: 'normal' },
    ],
  },
  {
    id: 'r-2',
    orderId: 'CPL-22764',
    title: 'Thyroid Profile & Vitamin D',
    patientName: 'Raman Krishnan',
    patientMeta: '63 yrs · Male',
    collectedOn: daysAgo(96),
    reportedOn: daysAgo(95),
    sharedWith: [],
    whatsappSent: true,
    results: [
      { group: 'Thyroid Profile', name: 'T3 (Triiodothyronine)', value: 1.1, unit: 'ng/mL', low: 0.8, high: 2.0, flag: 'normal' },
      { group: 'Thyroid Profile', name: 'T4 (Thyroxine)', value: 7.4, unit: 'µg/dL', low: 5.1, high: 14.1, flag: 'normal' },
      { group: 'Thyroid Profile', name: 'TSH', value: 5.2, unit: 'µIU/mL', low: 0.4, high: 4.0, flag: 'high' },
      { group: 'Vitamins', name: 'Vitamin D (25-OH)', value: 18.4, unit: 'ng/mL', low: 30, high: 100, flag: 'low' },
    ],
  },
  {
    id: 'r-3',
    orderId: 'CPL-21350',
    title: 'Complete Blood Count (CBC)',
    patientName: 'Priya Raman',
    patientMeta: '34 yrs · Female',
    collectedOn: daysAgo(188),
    reportedOn: daysAgo(188),
    sharedWith: [],
    whatsappSent: false,
    results: [
      { group: 'Complete Blood Count', name: 'Haemoglobin', value: 12.8, unit: 'g/dL', low: 12, high: 15.5, flag: 'normal' },
      { group: 'Complete Blood Count', name: 'Total WBC Count', value: 7200, unit: '/µL', low: 4000, high: 11000, flag: 'normal' },
      { group: 'Complete Blood Count', name: 'Platelet Count', value: 2.9, unit: 'lakh/µL', low: 1.5, high: 4.5, flag: 'normal' },
      { group: 'Complete Blood Count', name: 'RBC Count', value: 4.5, unit: 'million/µL', low: 3.8, high: 4.8, flag: 'normal' },
      { group: 'Complete Blood Count', name: 'MCV', value: 86, unit: 'fL', low: 83, high: 101, flag: 'normal' },
    ],
  },
]

export const healthMetrics: HealthMetric[] = [
  {
    id: 'hba1c',
    name: 'HbA1c',
    unit: '%',
    low: null,
    high: 5.7,
    rangeLabel: 'Normal: below 5.7 %',
    readings: [
      { date: daysAgo(560), value: 6.1 },
      { date: daysAgo(455), value: 5.9 },
      { date: daysAgo(340), value: 5.8 },
      { date: daysAgo(188), value: 5.7 },
      { date: daysAgo(20), value: 5.6 },
    ],
  },
  {
    id: 'cholesterol',
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    low: null,
    high: 200,
    rangeLabel: 'Desirable: below 200 mg/dL',
    readings: [
      { date: daysAgo(560), value: 188 },
      { date: daysAgo(455), value: 196 },
      { date: daysAgo(340), value: 205 },
      { date: daysAgo(188), value: 221 },
      { date: daysAgo(20), value: 212 },
    ],
  },
  {
    id: 'glucose',
    name: 'Fasting Glucose',
    unit: 'mg/dL',
    low: 70,
    high: 99,
    rangeLabel: 'Normal: 70 – 99 mg/dL',
    readings: [
      { date: daysAgo(560), value: 108 },
      { date: daysAgo(455), value: 104 },
      { date: daysAgo(340), value: 99 },
      { date: daysAgo(188), value: 96 },
      { date: daysAgo(20), value: 94 },
    ],
  },
  {
    id: 'haemoglobin',
    name: 'Haemoglobin',
    unit: 'g/dL',
    low: 12,
    high: 15.5,
    rangeLabel: 'Normal: 12 – 15.5 g/dL',
    readings: [
      { date: daysAgo(560), value: 11.4 },
      { date: daysAgo(455), value: 11.9 },
      { date: daysAgo(340), value: 12.3 },
      { date: daysAgo(188), value: 12.8 },
    ],
  },
  {
    id: 'tsh',
    name: 'TSH',
    unit: 'µIU/mL',
    low: 0.4,
    high: 4.0,
    rangeLabel: 'Normal: 0.4 – 4.0 µIU/mL',
    readings: [
      { date: daysAgo(455), value: 2.9 },
      { date: daysAgo(340), value: 3.1 },
      { date: daysAgo(188), value: 2.6 },
    ],
  },
  {
    id: 'vitd',
    name: 'Vitamin D',
    unit: 'ng/mL',
    low: 30,
    high: 100,
    rangeLabel: 'Sufficient: 30 – 100 ng/mL',
    readings: [
      { date: daysAgo(560), value: 16 },
      { date: daysAgo(455), value: 22 },
      { date: daysAgo(340), value: 27 },
      { date: daysAgo(188), value: 34 },
    ],
  },
]

/** Trend data per family member (keyed by member id). Members without an entry have no results yet. */
export const healthMetricsByMember: Record<string, HealthMetric[]> = {
  'm-1': healthMetrics,
  'm-2': [
    {
      id: 'tsh',
      name: 'TSH',
      unit: 'µIU/mL',
      low: 0.4,
      high: 4.0,
      rangeLabel: 'Normal: 0.4 – 4.0 µIU/mL',
      readings: [
        { date: daysAgo(460), value: 3.6 },
        { date: daysAgo(280), value: 4.4 },
        { date: daysAgo(95), value: 5.2 },
      ],
    },
    {
      id: 'vitd',
      name: 'Vitamin D',
      unit: 'ng/mL',
      low: 30,
      high: 100,
      rangeLabel: 'Sufficient: 30 – 100 ng/mL',
      readings: [
        { date: daysAgo(280), value: 14.9 },
        { date: daysAgo(95), value: 18.4 },
      ],
    },
  ],
}

/** Sample reminders for tests a member is due for. Booked orders are added to these at runtime. */
export interface TestReminder {
  id: string
  memberId: string
  title: string
  date: string
  note: string
}

export const testReminders: TestReminder[] = [
  { id: 'rem-1', memberId: 'm-1', title: 'HbA1c (Glycated Haemoglobin)', date: fmtDate(addDays(12)), note: '6-month follow-up' },
  { id: 'rem-2', memberId: 'm-2', title: 'Thyroid Profile (T3, T4, TSH)', date: fmtDate(addDays(5)), note: 'Repeat test' },
]
