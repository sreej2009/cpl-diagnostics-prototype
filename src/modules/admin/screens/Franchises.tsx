import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Plus, Store } from 'lucide-react'
import { cardClass, FilterChips, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { Field, Input } from '@/components/ui/Field'
import { Modal, useToast } from '@/components/ui/Overlay'
import type { Franchise } from '@/data/admin'
import { cn, compactInr } from '@/lib/utils'
import { useAdmin } from '../AdminContext'

type Filter = 'all' | Franchise['status']

export const franchiseTone: Record<Franchise['status'], BadgeTone> = { Active: 'green', Onboarding: 'amber', Suspended: 'red' }
export const shortName = (name: string) => name.replace('CPL Collection Centre — ', '')

const emptyForm = { name: '', owner: '', mobile: '', territory: '', commissionRate: '20' }

export default function Franchises() {
  const toast = useToast()
  const { franchises, addFranchise } = useAdmin()
  const [filter, setFilter] = useState<Filter>('all')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const set = (patch: Partial<typeof emptyForm>) => setForm((prev) => ({ ...prev, ...patch }))

  const errors = {
    name: form.name.trim().length < 3,
    owner: form.owner.trim().length < 2,
    mobile: form.mobile.length !== 10,
    territory: form.territory.trim().length < 3,
    rate: !(Number(form.commissionRate) > 0),
  }
  const valid = !Object.values(errors).some(Boolean)

  const add = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!valid) return
    addFranchise({
      name: form.name.trim(),
      owner: form.owner.trim(),
      mobile: `${form.mobile.slice(0, 5)} ${form.mobile.slice(5)}`,
      territory: form.territory.trim(),
      commissionRate: Number(form.commissionRate),
    })
    toast(`${form.name.trim()} added — onboarding started`)
    setForm(emptyForm)
    setSubmitted(false)
    setAdding(false)
    setFilter('all')
  }

  const count = (s: Franchise['status']) => franchises.filter((f) => f.status === s).length
  const rows = franchises.filter((f) => filter === 'all' || f.status === filter)
  const summary = [
    { label: 'Active', value: String(count('Active')) },
    { label: 'Orders this month', value: String(franchises.reduce((sum, f) => sum + f.orders, 0)) },
    { label: 'Revenue this month', value: compactInr(franchises.reduce((sum, f) => sum + f.revenue, 0)) },
  ]

  return (
    <Screen
      header={
        <>
          <TopBar
            title="Franchise Management"
            back="/admin/more"
            right={
              <button type="button" aria-label="Add franchise" onClick={() => setAdding(true)} className="grid size-9 place-items-center rounded-full bg-white text-slate-900">
                <Plus className="size-5" />
              </button>
            }
          />
          <div className="shrink-0 border-b border-slate-100 bg-white py-3">
            <FilterChips
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: franchises.length },
                { value: 'Active', label: 'Active', count: count('Active') },
                { value: 'Onboarding', label: 'Onboarding', count: count('Onboarding') },
                { value: 'Suspended', label: 'Suspended', count: count('Suspended') },
              ]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-4 px-5 py-4">
        <dl className={cn(cardClass, 'grid grid-cols-3 divide-x divide-slate-100 py-3')}>
          {summary.map((item) => (
            <div key={item.label} className="min-w-0 px-3 text-center">
              <dd className="text-[17px] font-extrabold tracking-tight text-slate-900 tabular-nums">{item.value}</dd>
              <dt className="mt-0.5 text-[11px] leading-tight font-medium text-slate-500">{item.label}</dt>
            </div>
          ))}
        </dl>

        {rows.length === 0 ? (
          <EmptyState icon={Store} title="No franchises in this view" description="Change the filter or add a franchise." />
        ) : (
          <ListGroup>
            {rows.map((f) => (
              <Link key={f.id} to={`/admin/franchises/${f.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <Store className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{shortName(f.name)}</p>
                  <p className="truncate text-xs text-slate-500">
                    {f.owner} · {f.orders} orders · {compactInr(f.revenue)}
                  </p>
                </div>
                <Badge tone={franchiseTone[f.status]} dot>
                  {f.status}
                </Badge>
                <ChevronRight className="size-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </ListGroup>
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} variant="sheet" title="Add franchise" description="New franchises start in onboarding until activated.">
        <form onSubmit={add} noValidate className="space-y-4">
          <Field label="Centre name">
            <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="CPL Collection Centre — Area" aria-invalid={submitted && errors.name} />
          </Field>
          <Field label="Owner name">
            <Input value={form.owner} onChange={(e) => set({ owner: e.target.value })} aria-invalid={submitted && errors.owner} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mobile">
              <Input value={form.mobile} onChange={(e) => set({ mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" placeholder="10 digits" aria-invalid={submitted && errors.mobile} />
            </Field>
            <Field label="Commission (%)">
              <Input value={form.commissionRate} onChange={(e) => set({ commissionRate: e.target.value.replace(/\D/g, '').slice(0, 2) })} inputMode="numeric" aria-invalid={submitted && errors.rate} />
            </Field>
          </div>
          <Field label="Territory" hint="Areas this franchise is allowed to serve.">
            <Input value={form.territory} onChange={(e) => set({ territory: e.target.value })} placeholder="e.g. Ambattur, Padi, Mogappair" aria-invalid={submitted && errors.territory} />
          </Field>
          {submitted && !valid && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {errors.name || errors.owner
                ? 'Enter the centre name and the owner name.'
                : errors.mobile
                  ? 'Enter a 10-digit mobile number.'
                  : errors.territory
                    ? 'Enter the territory this franchise serves.'
                    : 'Enter a commission rate above 0%.'}
            </p>
          )}
          <Button type="submit" size="lg" block>
            Add franchise
          </Button>
        </form>
      </Modal>
    </Screen>
  )
}
