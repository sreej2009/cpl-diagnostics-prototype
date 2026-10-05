import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronRight, Pencil, Plus, SearchX } from 'lucide-react'
import { FilterChips, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DetailRow, EmptyState } from '@/components/ui/Display'
import { Field, Input, SearchInput, Select, Toggle } from '@/components/ui/Field'
import { Modal, useToast } from '@/components/ui/Overlay'
import { Tabs } from '@/components/ui/Tabs'
import { categories, packages as seedPackages, testById, tests as seedTests } from '@/data/catalog'
import { cn, inr, pctOff } from '@/lib/utils'
import { useAdminState } from '../AdminContext'
import type { TestCategory } from '@/types'

type Kind = 'tests' | 'packages'
type Availability = 'all' | 'on' | 'off'

/** The fields the editor can change, shared by tests and packages. */
interface Draft {
  id: string | null
  name: string
  price: string
  mrp: string
  reportTime: string
  category: TestCategory
  sampleType: string
}

const emptyDraft: Draft = { id: null, name: '', price: '', mrp: '', reportTime: '24 hrs', category: 'Blood', sampleType: 'Blood' }

export default function Catalog() {
  const toast = useToast()
  const [kind, setKind] = useState<Kind>('tests')
  const [tests, setTests] = useAdminState('catalog.tests', seedTests)
  const [packages, setPackages] = useAdminState('catalog.packages', seedPackages)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<TestCategory | 'All'>('All')
  const [availability, setAvailability] = useState<Availability>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [submitted, setSubmitted] = useState(false)
  /** Opens or closes the editor with a clean validation state. */
  const openDraft = (next: Draft | null) => {
    setSubmitted(false)
    setDraft(next)
  }
  const set = (patch: Partial<Draft>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev))

  const q = query.trim().toLowerCase()
  const available = (active: boolean) => availability === 'all' || (availability === 'on') === active
  const shownTests = tests.filter(
    (t) => available(t.active) && (category === 'All' || t.category === category) && (q === '' || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)),
  )
  const shownPackages = packages.filter((p) => available(p.active) && (q === '' || p.name.toLowerCase().includes(q)))

  const openTest = kind === 'tests' ? tests.find((t) => t.id === openId) : undefined
  const openPackage = kind === 'packages' ? packages.find((p) => p.id === openId) : undefined
  const open = openTest ?? openPackage

  const setActive = (id: string, active: boolean) => {
    if (kind === 'tests') setTests((prev) => prev.map((x) => (x.id === id ? { ...x, active } : x)))
    else setPackages((prev) => prev.map((x) => (x.id === id ? { ...x, active } : x)))
    toast(active ? 'Now bookable in the Patient App' : 'Bookings switched off')
  }

  const valid = draft !== null && draft.name.trim().length > 2 && Number(draft.price) > 0 && Number(draft.mrp) >= Number(draft.price)

  const save = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!draft || !valid) return
    const common = { name: draft.name.trim(), price: Number(draft.price), mrp: Number(draft.mrp), reportTime: draft.reportTime }
    if (kind === 'tests') {
      const fields = { ...common, category: draft.category, sampleType: draft.sampleType }
      setTests((prev) =>
        draft.id
          ? prev.map((t) => (t.id === draft.id ? { ...t, ...fields } : t))
          : [{ id: `t-${Date.now()}`, fasting: null, parameters: 1, active: true, description: 'Added in this prototype session.', ...fields }, ...prev],
      )
    } else {
      setPackages((prev) => prev.map((p) => (p.id === draft.id ? { ...p, ...common } : p)))
    }
    toast(draft.id ? `${common.name} updated` : `${common.name} added to the catalogue`)
    openDraft(null)
  }

  const startEdit = () => {
    if (!open) return
    openDraft({
      ...emptyDraft,
      id: open.id,
      name: open.name,
      price: String(open.price),
      mrp: String(open.mrp),
      reportTime: open.reportTime,
      ...(openTest ? { category: openTest.category, sampleType: openTest.sampleType } : {}),
    })
    setOpenId(null)
  }

  const rows = kind === 'tests' ? shownTests : shownPackages

  return (
    <Screen
      header={
        <>
          <TopBar
            title="Test & Package Management"
            back="/admin/more"
            right={
              kind === 'tests' && (
                <button type="button" aria-label="Add test" onClick={() => openDraft(emptyDraft)} className="grid size-9 place-items-center rounded-full bg-white text-slate-900">
                  <Plus className="size-5" />
                </button>
              )
            }
          />
          <div className="shrink-0 border-b border-slate-100 bg-white pt-3 pb-3">
            <div className="space-y-3 px-5">
              <Tabs
                block
                value={kind}
                onChange={(k) => {
                  setKind(k)
                  setOpenId(null)
                }}
                options={[
                  { value: 'tests', label: 'Tests', count: tests.length },
                  { value: 'packages', label: 'Health Packages', count: packages.length },
                ]}
              />
              <SearchInput value={query} onChange={setQuery} placeholder={`Search ${kind}`} className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50" />
            </div>
            {kind === 'tests' && (
              <FilterChips className="mt-3" value={category} onChange={setCategory} options={(['All', ...categories] as const).map((c) => ({ value: c, label: c }))} />
            )}
          </div>
        </>
      }
    >
      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-500">
            {rows.length} {kind === 'tests' ? 'tests' : 'packages'}
          </p>
          <Tabs
            value={availability}
            onChange={setAvailability}
            options={[
              { value: 'all', label: 'All' },
              { value: 'on', label: 'Bookable' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="Nothing matches" description="Try a different search, category or availability." />
        ) : (
          <ListGroup>
            {rows.map((item) => (
              <button key={item.id} type="button" onClick={() => setOpenId(item.id)} className={cn('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50', !item.active && 'bg-slate-50/70')}>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm leading-snug font-bold', item.active ? 'text-slate-900' : 'text-slate-500')}>{item.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {'category' in item ? `${item.category} · Report in ${item.reportTime}` : `${item.testIds.length} tests · ${item.parameters} parameters`}
                  </p>
                  {!item.active && (
                    <Badge tone="neutral" className="mt-1.5">
                      Not bookable
                    </Badge>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-slate-900 tabular-nums">{inr(item.price)}</p>
                  <p className="text-[11px] text-slate-400">
                    <span className="line-through">{inr(item.mrp)}</span> <span className="font-bold text-teal-600">{pctOff(item.price, item.mrp)}%</span>
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Details */}
      <Modal
        open={open !== undefined}
        onClose={() => setOpenId(null)}
        variant="sheet"
        title={open?.name ?? ''}
        description={openTest ? openTest.description : openPackage?.tagline}
        footer={
          <Button size="lg" block icon={Pencil} onClick={startEdit}>
            Edit price & details
          </Button>
        }
      >
        {open && (
          <>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Bookable in the Patient App</p>
                <p className="text-xs text-slate-500">{open.active ? 'Patients can book this now.' : 'Hidden from new bookings.'}</p>
              </div>
              <Toggle checked={open.active} onChange={(active) => setActive(open.id, active)} label={`${open.name} bookable`} />
            </div>
            <dl className="mt-3 divide-y divide-slate-100">
              <DetailRow label="Price">
                {inr(open.price)} <span className="font-medium text-slate-400 line-through">{inr(open.mrp)}</span>{' '}
                <span className="text-teal-600">{pctOff(open.price, open.mrp)}% off</span>
              </DetailRow>
              <DetailRow label="Report time">{open.reportTime}</DetailRow>
              <DetailRow label="Fasting">{open.fasting ?? 'Not needed'}</DetailRow>
              {openTest && <DetailRow label="Category">{openTest.category}</DetailRow>}
              {openTest && <DetailRow label="Sample">{openTest.sampleType}</DetailRow>}
              <DetailRow label="Parameters">{open.parameters}</DetailRow>
              {openPackage && <DetailRow label="Ideal for">{openPackage.idealFor}</DetailRow>}
              {openPackage && (
                <DetailRow label="Includes">
                  {openPackage.testIds
                    .map((id) => testById(id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </DetailRow>
              )}
            </dl>
          </>
        )}
      </Modal>

      {/* Add / edit */}
      <Modal
        open={draft !== null}
        onClose={() => openDraft(null)}
        variant="sheet"
        title={draft?.id ? `Edit ${kind === 'tests' ? 'test' : 'package'}` : 'Add test'}
        description="Changes apply to new bookings only."
      >
        {draft && (
          <form onSubmit={save} className="space-y-4">
            <Field label="Name">
              <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Serum Calcium" aria-invalid={submitted && draft.name.trim().length < 3} />
              {submitted && draft.name.trim().length < 3 && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter a name of at least 3 characters.</span>}
            </Field>
            {kind === 'tests' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Select value={draft.category} onChange={(e) => set({ category: e.target.value as TestCategory })}>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Sample type">
                  <Select value={draft.sampleType} onChange={(e) => set({ sampleType: e.target.value })}>
                    <option>Blood</option>
                    <option>Urine</option>
                  </Select>
                </Field>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹)">
                <Input value={draft.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, '') })} inputMode="numeric" />
              </Field>
              <Field label="MRP (₹)">
                <Input value={draft.mrp} onChange={(e) => set({ mrp: e.target.value.replace(/\D/g, '') })} inputMode="numeric" />
              </Field>
            </div>
            <Field label="Report time">
              <Select value={draft.reportTime} onChange={(e) => set({ reportTime: e.target.value })}>
                {['6 hrs', '8 hrs', '12 hrs', '24 hrs', '48 hrs'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            {submitted && !(Number(draft.price) > 0) && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                Enter a price above ₹0.
              </p>
            )}
            {submitted && Number(draft.price) > 0 && draft.mrp === '' && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                Enter the MRP.
              </p>
            )}
            {draft.price !== '' && draft.mrp !== '' && Number(draft.mrp) < Number(draft.price) && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                MRP cannot be lower than the price.
              </p>
            )}
            <Button type="submit" size="lg" block>
              {draft.id ? 'Save changes' : 'Add test'}
            </Button>
          </form>
        )}
      </Modal>
    </Screen>
  )
}
