import { createContext, useCallback, useContext, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { adminAlerts, adminOrders, franchises as seedFranchises, phlebotomists } from '@/data/admin'
import type { AdminAlert, Franchise } from '@/data/admin'
import { stageFromStatus, statusForStage } from '@/lib/sample'
import type { SampleStage } from '@/lib/sample'
import { usePersistentState } from '@/lib/usePersistentState'
import type { Order, OrderStatus, PaymentStatus, Phlebotomist } from '@/types'

interface AdminContextValue {
  authed: boolean
  login: () => void
  logout: () => void

  orders: Order[]
  phlebotomists: Phlebotomist[]
  phlebotomistName: (id?: string) => string | undefined
  setOrderStatus: (orderId: string, status: OrderStatus) => void
  assignPhlebotomist: (orderId: string, phlebotomistId: string) => void
  setPaymentStatus: (orderId: string, status: PaymentStatus) => void

  /** Where an order's sample is in the six-stage lifecycle (null once cancelled). */
  sampleStage: (order: Order) => SampleStage | null
  setSampleStage: (orderId: string, stage: SampleStage) => void

  franchises: Franchise[]
  setFranchiseStatus: (id: string, status: Franchise['status']) => void
  addFranchise: (franchise: Pick<Franchise, 'name' | 'owner' | 'mobile' | 'territory' | 'commissionRate'>) => void

  alerts: AdminAlert[]
  /** Screen state kept for the session so it survives moving between screens. Use `useAdminState`. */
  store: Record<string, unknown>
  setStore: Dispatch<SetStateAction<Record<string, unknown>>>
  unreadAlerts: number
  setAlertRead: (alertId: string, read: boolean) => void
  markAllAlertsRead: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>')
  return ctx
}

/** Orders are shared across the admin screens so a change on one shows up on the others. */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = usePersistentState('cpl.admin.authed', false)
  const [orders, setOrders] = useState(adminOrders)
  // "Received at laboratory" has no order status of its own, so it is tracked separately.
  const [receivedAtLab, setReceivedAtLab] = useState<string[]>(['CPL-24829'])
  const [alerts, setAlerts] = useState(adminAlerts)
  const [store, setStore] = useState<Record<string, unknown>>({})
  const [franchises, setFranchises] = useState(seedFranchises)

  const patch = useCallback(
    (orderId: string, change: (order: Order) => Order) =>
      setOrders((prev) => prev.map((o) => (o.id === orderId ? change(o) : o))),
    [],
  )

  const sampleStage = (order: Order) =>
    order.status === 'collected' && receivedAtLab.includes(order.id) ? 'received' : stageFromStatus(order.status)

  // An alert is resolved once the thing it warned about has happened to its order.
  const isResolved = (alert: AdminAlert) => {
    const order = orders.find((o) => o.id === alert.orderId)
    if (!order || !alert.clearsWhen) return false
    if (order.status === 'cancelled') return true
    switch (alert.clearsWhen) {
      case 'assigned':
        return order.status !== 'placed'
      case 'collected':
        return order.status !== 'placed' && order.status !== 'assigned'
      case 'at-lab':
        return sampleStage(order) !== 'collected'
      case 'reported':
        return order.status === 'reported'
      case 'paid':
        return order.payment.status !== 'failed'
    }
  }
  const liveAlerts = alerts.map((a) => ({ ...a, resolved: isResolved(a) }))

  const value: AdminContextValue = {
    authed,
    login: () => setAuthed(true),
    logout: () => setAuthed(false),
    orders,
    phlebotomists,
    phlebotomistName: (id) => phlebotomists.find((p) => p.id === id)?.name,
    setOrderStatus: (orderId, status) =>
      patch(orderId, (o) => ({
        ...o,
        status,
        // a cancelled, already-paid order is refunded
        payment: status === 'cancelled' && o.payment.status === 'paid' ? { ...o.payment, status: 'refunded' } : o.payment,
      })),
    assignPhlebotomist: (orderId, phlebotomistId) =>
      patch(orderId, (o) => ({ ...o, phlebotomistId, status: o.status === 'placed' ? 'assigned' : o.status })),
    setPaymentStatus: (orderId, status) => patch(orderId, (o) => ({ ...o, payment: { ...o.payment, status } })),
    sampleStage,
    setSampleStage: (orderId, stage) => {
      patch(orderId, (o) => ({ ...o, status: statusForStage[stage] }))
      setReceivedAtLab((prev) =>
        stage === 'received' ? [...new Set([...prev, orderId])] : prev.filter((id) => id !== orderId),
      )
    },
    franchises,
    setFranchiseStatus: (id, status) => setFranchises((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f))),
    // new franchises start in onboarding with no orders yet
    addFranchise: (franchise) =>
      setFranchises((prev) => [...prev, { ...franchise, id: `fr-${Date.now()}`, status: 'Onboarding', orders: 0, revenue: 0 }]),
    alerts: liveAlerts,
    unreadAlerts: liveAlerts.filter((a) => !a.read && !a.resolved).length,
    store,
    setStore,
    setAlertRead: (alertId, read) => setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read } : a))),
    markAllAlertsRead: () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true }))),
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

/**
 * useState for admin screens whose changes should still be there when the user comes back
 * to the screen. Kept in memory for the session only — there is no backend.
 */
export function useAdminState<T>(key: string, initial: T) {
  const { store, setStore } = useAdmin()
  const value = (key in store ? store[key] : initial) as T
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) =>
      setStore((prev) => {
        const current = (key in prev ? prev[key] : initial) as T
        return { ...prev, [key]: typeof next === 'function' ? (next as (prev: T) => T)(current) : next }
      }),
    // `initial` is a constant per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, setStore],
  )
  return [value, setValue] as const
}
