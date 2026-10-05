import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Check, CircleCheck, Clock, Plus, Send, Utensils, X } from 'lucide-react'
import { cardClass, FilterChips, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, SearchInput, Textarea } from '@/components/ui/Field'
import { Modal, useToast } from '@/components/ui/Overlay'
import { Tabs } from '@/components/ui/Tabs'
import { packages, tests } from '@/data/catalog'
import type { Recommendation } from '@/data/doctor'
import { cn, inr } from '@/lib/utils'
import { useDoctor } from '../DoctorContext'

const statusTone: Record<Recommendation['status'], BadgeTone> = { Sent: 'neutral', Viewed: 'brand', Booked: 'green' }

interface CatalogItem {
  id: string
  name: string
  group: string
  price: number
  description: string
  reportTime: string
  fasting: string | null
}

/** Tests and packages in one pick-list, with the catalogue's own description and preparation details. */
const catalog: CatalogItem[] = [
  ...packages
    .filter((p) => p.active)
    .map((p) => ({ id: p.id, name: p.name, group: 'Health Package', price: p.price, description: `${p.testIds.length} tests · ${p.tagline}`, reportTime: p.reportTime, fasting: p.fasting })),
  ...tests
    .filter((t) => t.active)
    .map((t) => ({ id: t.id, name: t.name, group: t.category, price: t.price, description: t.description, reportTime: t.reportTime, fasting: t.fasting })),
]
const groups = ['All', ...new Set(catalog.map((c) => c.group))]

function Prep({ item }: { item: CatalogItem }) {
  return (
    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-medium text-slate-500">
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3 text-slate-400" />
        Report in {item.reportTime}
      </span>
      <span className="inline-flex items-center gap-1">
        <Utensils className="size-3 text-slate-400" />
        {item.fasting ? `Fasting ${item.fasting}` : 'No fasting'}
      </span>
    </span>
  )
}

export default function Recommend() {
  const toast = useToast()
  const [params] = useSearchParams()
  const { recommendations, addRecommendation } = useDoctor()
  const [tab, setTab] = useState<'new' | 'sent'>('new')
  const [patient, setPatient] = useState(params.get('patient') ?? '')
  const [mobile, setMobile] = useState(params.get('mobile') ?? '')
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All')
  const [submitted, setSubmitted] = useState(false)
  const [sentTo, setSentTo] = useState<{ name: string; items: string[] } | null>(null)

  const q = query.trim().toLowerCase()
  const options = catalog.filter(
    (c) => (group === 'All' || c.group === group) && (q === '' || c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)),
  )
  const picked = catalog.filter((c) => selected.includes(c.id))
  const total = picked.reduce((sum, p) => sum + p.price, 0)
  const nameError = patient.trim().length < 2
  const mobileError = mobile.length !== 10
  const itemsError = picked.length === 0
  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const submit = () => {
    setSubmitted(true)
    if (nameError || mobileError || itemsError) return
    const items = picked.map((p) => p.name)
    addRecommendation({ patient: patient.trim(), mobile: `${mobile.slice(0, 5)} ${mobile.slice(5)}`, items, note: note.trim() })
    toast(`Recommendation sent to ${patient.trim()}`)
    setSentTo({ name: patient.trim(), items })
    setPatient('')
    setMobile('')
    setNote('')
    setSelected([])
    setSubmitted(false)
  }

  return (
    <Screen
      header={
        <>
          <TopBar title="Test Recommendation" back="/doctor" />
          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3">
            <Tabs
              block
              value={tab}
              onChange={setTab}
              options={[
                { value: 'new', label: 'New' },
                { value: 'sent', label: 'Sent', count: recommendations.length },
              ]}
            />
          </div>
        </>
      }
      footer={
        tab === 'new' &&
        !sentTo && (
          <div className="flex items-center gap-4">
            <div className="shrink-0 leading-tight">
              <p className="text-[11px] font-medium text-slate-500">
                {picked.length} {picked.length === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xl font-extrabold tracking-tight text-slate-900">{inr(total)}</p>
            </div>
            <Button size="lg" block icon={Send} onClick={submit}>
              Send to patient
            </Button>
          </div>
        )
      }
    >
      {tab === 'sent' ? (
        <div className="space-y-3 px-5 py-5">
          {recommendations.map((rec) => (
            <article key={rec.id} className={cn(cardClass, 'p-4')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-slate-900">{rec.patient}</p>
                  <p className="text-xs text-slate-500">
                    +91 {rec.mobile} · {rec.sentOn}
                  </p>
                </div>
                <Badge tone={statusTone[rec.status]} dot>
                  {rec.status}
                </Badge>
              </div>
              <p className="mt-2.5 text-[13px] leading-snug text-slate-700">{rec.items.join(', ')}</p>
              {rec.note && <p className="mt-1 text-xs text-slate-500 italic">“{rec.note}”</p>}
            </article>
          ))}
        </div>
      ) : sentTo ? (
        <div className="px-5 py-8 text-center">
          <span className="mx-auto grid size-16 animate-pop place-items-center rounded-full bg-teal-500 text-white shadow-float">
            <CircleCheck className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">Recommendation sent</h2>
          <p className="mt-1 text-sm text-slate-500">{sentTo.name} can book these tests in the CPL app.</p>
          <ul className={cn(cardClass, 'mt-5 divide-y divide-slate-100 text-left')}>
            {sentTo.items.map((item) => (
              <li key={item} className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-900">
                <Check className="size-4 shrink-0 text-teal-600" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="secondary" block onClick={() => { setSentTo(null); setTab('sent') }}>
              View sent
            </Button>
            <Button block onClick={() => setSentTo(null)}>
              Send another
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-400">Prototype — no message is actually sent.</p>
        </div>
      ) : (
        <div className="space-y-4 px-5 py-5">
          <Field label="Patient name">
            <Input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Full name" aria-invalid={submitted && nameError} />
            {submitted && nameError && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter the patient's name.</span>}
          </Field>
          <Field label="Patient mobile">
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              placeholder="10-digit mobile number"
              aria-invalid={submitted && mobileError}
            />
            {submitted && mobileError && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter a 10-digit mobile number.</span>}
          </Field>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-slate-700">Recommended tests</p>
            {picked.length > 0 && (
              <ListGroup className="mb-3">
                {picked.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 py-3 pr-2 pl-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="min-w-0 text-sm leading-snug font-bold text-slate-900">{p.name}</p>
                        <p className="shrink-0 text-[13px] font-bold text-slate-700 tabular-nums">{inr(p.price)}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">{p.description}</p>
                      <Prep item={p} />
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${p.name}`}
                      onClick={() => toggle(p.id)}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </ListGroup>
            )}
            <button
              type="button"
              onClick={() => setPicking(true)}
              className={cn(
                'flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed text-[13px] font-bold',
                submitted && itemsError ? 'border-red-300 text-red-600' : 'border-brand-300 text-brand-700',
              )}
            >
              <Plus className="size-4" />
              {picked.length > 0 ? 'Add more tests' : 'Add tests or packages'}
            </button>
            {submitted && itemsError && <p className="mt-1.5 text-xs font-semibold text-red-600">Add at least one test or package.</p>}
          </div>

          <Field label="Note to patient (optional)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Please book a morning slot." />
          </Field>
          <p className="text-xs leading-relaxed text-slate-400">
            Descriptions and preparation details come from the CPL catalogue. The patient receives the list and books it in
            the CPL app.
          </p>
        </div>
      )}

      <Modal
        open={picking}
        onClose={() => setPicking(false)}
        variant="sheet"
        title="Add tests"
        description={`${picked.length} selected`}
        footer={
          <Button size="lg" block onClick={() => setPicking(false)}>
            Done
          </Button>
        }
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search tests or packages" />
        <FilterChips className="-mx-5 mt-3" value={group} onChange={setGroup} options={groups.map((g) => ({ value: g, label: g }))} />
        <ul className="mt-2 divide-y divide-slate-100">
          {options.map((option) => {
            const on = selected.includes(option.id)
            return (
              <li key={option.id}>
                <button type="button" aria-pressed={on} onClick={() => toggle(option.id)} className="flex w-full items-start gap-3 py-3 text-left">
                  <span
                    className={cn(
                      'mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg',
                      on ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {on ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 text-sm leading-snug font-semibold text-slate-900">{option.name}</span>
                      <span className="shrink-0 text-[13px] font-bold text-slate-700 tabular-nums">{inr(option.price)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-500">{option.description}</span>
                    <Prep item={option} />
                  </span>
                </button>
              </li>
            )
          })}
          {options.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No tests match this search.</li>}
        </ul>
      </Modal>
    </Screen>
  )
}
