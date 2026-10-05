import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { packageById, testById } from '@/data/catalog'
import { addresses as seedAddresses, familyMembers, initialOrders, initialReports } from '@/data/patient'
import { stepsFor } from '@/lib/status'
import { usePersistentState } from '@/lib/usePersistentState'
import { fmtDate } from '@/lib/utils'
import type { Address, CollectionType, FamilyMember, LabReport, Order, PaymentMethod } from '@/types'

export interface PatientUser {
  name: string
  mobile: string
}

export interface CartLine {
  id: string
  kind: 'test' | 'package'
  name: string
  price: number
  mrp: number
  meta: string
  fasting: string | null
}

export interface OrderInput {
  collectionType: CollectionType
  location: string
  area: string
  date: string
  slot: string
  member: FamilyMember
  paymentMethod: PaymentMethod
  referredBy?: string
}

interface PatientContextValue {
  user: PatientUser | null
  login: (user: PatientUser) => void
  logout: () => void

  cartLines: CartLine[]
  cartTotal: { price: number; mrp: number }
  inCart: (id: string) => boolean
  toggleCart: (id: string) => void

  preferredCollection: CollectionType
  setPreferredCollection: (type: CollectionType) => void

  members: FamilyMember[]
  addMember: (member: Omit<FamilyMember, 'id'>) => FamilyMember
  updateMember: (id: string, patch: Partial<Omit<FamilyMember, 'id'>>) => void
  removeMember: (id: string) => void
  /** The family member whose orders, reports and health history are being viewed. */
  selectedMember: FamilyMember
  selectMember: (id: string) => void
  addresses: Address[]
  addAddress: (address: Omit<Address, 'id'>) => Address

  orders: Order[]
  placeOrder: (input: OrderInput) => Order
  /** Prototype control: move an order to its next workflow stage. */
  advanceOrder: (id: string) => void

  reports: LabReport[]
  shareReport: (id: string, doctorName: string) => void
  markWhatsappSent: (id: string) => void

  whatsappOptIn: boolean
  setWhatsappOptIn: (on: boolean) => void
}

const PatientContext = createContext<PatientContextValue | null>(null)

export function usePatient() {
  const ctx = useContext(PatientContext)
  if (!ctx) throw new Error('usePatient must be used inside <PatientProvider>')
  return ctx
}

function toCartLine(id: string): CartLine | null {
  const test = testById(id)
  if (test) {
    return {
      id,
      kind: 'test',
      name: test.name,
      price: test.price,
      mrp: test.mrp,
      meta: `${test.sampleType} · Report in ${test.reportTime}`,
      fasting: test.fasting,
    }
  }
  const pkg = packageById(id)
  if (pkg) {
    return {
      id,
      kind: 'package',
      name: pkg.name,
      price: pkg.price,
      mrp: pkg.mrp,
      meta: `${pkg.testIds.length} tests · ${pkg.parameters} parameters`,
      fasting: pkg.fasting,
    }
  }
  return null
}

/** Stand-in results for reports generated while demoing the order workflow. */
function demoReport(order: Order): LabReport {
  const today = fmtDate(new Date())
  return {
    id: `r-${order.id}`,
    orderId: order.id,
    title: order.items.map((i) => i.name).join(' & '),
    patientName: order.patient.name,
    patientMeta: `${order.patient.age} yrs · ${order.patient.gender}`,
    collectedOn: order.date,
    reportedOn: today,
    sharedWith: [],
    whatsappSent: true,
    results: [
      { group: 'Summary', name: 'Haemoglobin', value: 13.1, unit: 'g/dL', low: 12, high: 15.5, flag: 'normal' },
      { group: 'Summary', name: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', low: 70, high: 99, flag: 'normal' },
      { group: 'Summary', name: 'Total Cholesterol', value: 204, unit: 'mg/dL', low: null, high: 200, flag: 'high' },
      { group: 'Summary', name: 'TSH', value: 2.4, unit: 'µIU/mL', low: 0.4, high: 4.0, flag: 'normal' },
      { group: 'Summary', name: 'Creatinine', value: 0.8, unit: 'mg/dL', low: 0.6, high: 1.1, flag: 'normal' },
    ],
  }
}

export function PatientProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersistentState<PatientUser | null>('cpl.patient.user', null)
  const [cartIds, setCartIds] = usePersistentState<string[]>('cpl.patient.cart', [])
  const [preferredCollection, setPreferredCollection] = usePersistentState<CollectionType>('cpl.patient.collection', 'home')
  const [members, setMembers] = usePersistentState('cpl.patient.members', familyMembers)
  const [selectedMemberId, setSelectedMemberId] = usePersistentState('cpl.patient.selectedMember', familyMembers[0].id)
  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? members[0]
  const [addresses, setAddresses] = usePersistentState('cpl.patient.addresses', seedAddresses)
  const [orders, setOrders] = usePersistentState('cpl.patient.orders', initialOrders)
  const [reports, setReports] = usePersistentState('cpl.patient.reports', initialReports)
  const [whatsappOptIn, setWhatsappOptIn] = usePersistentState('cpl.patient.whatsapp', true)

  const cartLines = useMemo(
    () => cartIds.map(toCartLine).filter((line): line is CartLine => line !== null),
    [cartIds],
  )
  const cartTotal = useMemo(
    () => ({
      price: cartLines.reduce((sum, l) => sum + l.price, 0),
      mrp: cartLines.reduce((sum, l) => sum + l.mrp, 0),
    }),
    [cartLines],
  )

  const toggleCart = useCallback(
    (id: string) => setCartIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setCartIds],
  )

  const addMember = useCallback(
    (member: Omit<FamilyMember, 'id'>) => {
      const created = { ...member, id: `m-${Date.now()}` }
      setMembers((prev) => [...prev, created])
      return created
    },
    [setMembers],
  )

  const addAddress = useCallback(
    (address: Omit<Address, 'id'>) => {
      const created = { ...address, id: `a-${Date.now()}` }
      setAddresses((prev) => [...prev, created])
      return created
    },
    [setAddresses],
  )

  const placeOrder = useCallback(
    (input: OrderInput) => {
      const order: Order = {
        id: `CPL-${24818 + orders.length}`,
        patient: {
          name: input.member.name,
          age: input.member.age,
          gender: input.member.gender,
          mobile: input.member.mobile,
        },
        items: cartLines.map((l) => ({ id: l.id, name: l.name, kind: l.kind, price: l.price })),
        total: cartTotal.price,
        collectionType: input.collectionType,
        location: input.location,
        area: input.area,
        date: input.date,
        slot: input.slot,
        status: 'placed',
        payment: { method: input.paymentMethod, status: input.paymentMethod === 'cod' ? 'pending' : 'paid' },
        source: input.referredBy ? 'doctor' : 'app',
        sourceName: input.referredBy,
        placedAt: fmtDate(new Date()),
      }
      setOrders((prev) => [order, ...prev])
      setCartIds([])
      return order
    },
    [orders.length, cartLines, cartTotal.price, setOrders, setCartIds],
  )

  const advanceOrder = useCallback(
    (id: string) => {
      const order = orders.find((o) => o.id === id)
      if (!order) return
      const steps = stepsFor(order.collectionType)
      const next = steps[steps.findIndex((s) => s.key === order.status) + 1]
      if (!next) return

      const updated: Order = {
        ...order,
        status: next.key,
        phlebotomistId: next.key === 'assigned' ? 'ph-1' : order.phlebotomistId,
        // COD is settled when the sample is collected
        payment: next.key === 'collected' ? { ...order.payment, status: 'paid' } : order.payment,
      }
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      if (next.key === 'reported') setReports((prev) => [demoReport(updated), ...prev])
    },
    [orders, setOrders, setReports],
  )

  const shareReport = useCallback(
    (id: string, doctorName: string) =>
      setReports((prev) =>
        prev.map((r) =>
          r.id === id && !r.sharedWith.includes(doctorName) ? { ...r, sharedWith: [...r.sharedWith, doctorName] } : r,
        ),
      ),
    [setReports],
  )

  const markWhatsappSent = useCallback(
    (id: string) => setReports((prev) => prev.map((r) => (r.id === id ? { ...r, whatsappSent: true } : r))),
    [setReports],
  )

  const value: PatientContextValue = {
    user,
    login: setUser,
    logout: () => setUser(null),
    cartLines,
    cartTotal,
    inCart: (id) => cartIds.includes(id),
    toggleCart,
    preferredCollection,
    setPreferredCollection,
    members,
    addMember,
    updateMember: (id, patch) => setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    // the account holder (first profile) can never be removed
    removeMember: (id) => setMembers((prev) => (prev[0]?.id === id ? prev : prev.filter((m) => m.id !== id))),
    selectedMember,
    selectMember: setSelectedMemberId,
    addresses,
    addAddress,
    orders,
    placeOrder,
    advanceOrder,
    reports,
    shareReport,
    markWhatsappSent,
    whatsappOptIn,
    setWhatsappOptIn,
  }

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
}
