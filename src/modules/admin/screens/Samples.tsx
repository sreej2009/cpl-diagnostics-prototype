import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, ScanBarcode, SearchX } from 'lucide-react'
import { cardClass, FilterChips } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Display'
import { SkeletonList, useMockLoading } from '@/components/ui/States'
import { SearchInput } from '@/components/ui/Field'
import { SAMPLE_STAGES, sampleBarcode, sampleStagesFor } from '@/lib/sample'
import type { SampleStage } from '@/lib/sample'
import { cn } from '@/lib/utils'
import { useAdmin } from '../AdminContext'

type Filter = 'all' | 'awaiting' | SampleStage

export const stageLabel = Object.fromEntries(SAMPLE_STAGES.map((s) => [s.key, s.label])) as Record<SampleStage, string>

export const stageTone: Record<SampleStage, BadgeTone> = {
  placed: 'amber',
  assigned: 'amber',
  collected: 'brand',
  received: 'brand',
  processing: 'teal',
  ready: 'green',
}

export default function Samples() {
  const { orders, sampleStage } = useAdmin()
  const loading = useMockLoading()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  // Cancelled orders have no sample to track.
  const samples = orders
    .map((order) => ({ order, stage: sampleStage(order), barcode: sampleBarcode(order.id) }))
    .filter((s): s is typeof s & { stage: SampleStage } => s.stage !== null)

  const matchesFilter = (stage: SampleStage) =>
    filter === 'all' || (filter === 'awaiting' ? stage === 'placed' || stage === 'assigned' : stage === filter)
  // Search by order ID or sample barcode; dashes and spaces are ignored.
  const q = query.replace(/[\s-]/g, '').toLowerCase()
  const rows = samples.filter(
    (s) => matchesFilter(s.stage) && (q === '' || s.order.id.replace('-', '').toLowerCase().includes(q) || s.barcode.replace(/-/g, '').toLowerCase().includes(q)),
  )
  const count = (f: Filter) =>
    samples.filter((s) => (f === 'all' ? true : f === 'awaiting' ? s.stage === 'placed' || s.stage === 'assigned' : s.stage === f)).length

  return (
    <Screen
      header={
        <>
          <TopBar title="Sample Tracking" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white pt-3 pb-3">
            <div className="px-5">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search order ID or sample barcode"
                className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50"
              />
            </div>
            <FilterChips
              className="mt-3"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: count('all') },
                { value: 'awaiting', label: 'Awaiting collection', count: count('awaiting') },
                { value: 'collected', label: 'In transit', count: count('collected') },
                { value: 'received', label: 'At lab', count: count('received') },
                { value: 'processing', label: 'Processing', count: count('processing') },
                { value: 'ready', label: 'Report ready', count: count('ready') },
              ]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-3 px-5 py-4">
        {loading ? (
          <SkeletonList />
        ) : rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No samples found" description="Check the order ID or barcode, or clear the filter." />
        ) : (
          rows.map(({ order, stage, barcode }) => {
            const stages = sampleStagesFor(order.collectionType)
            const current = stages.findIndex((s) => s.key === stage)
            return (
              <Link key={order.id} to={`/admin/samples/${order.id}`} className={cn(cardClass, 'block p-4')}>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <ScanBarcode className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold tracking-wider text-slate-900">{barcode}</p>
                    <p className="truncate text-xs text-slate-500">
                      {order.id} · {order.patient.name}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-5 shrink-0 text-slate-300" />
                </div>
                <div className="mt-3 flex gap-1" aria-hidden="true">
                  {stages.map((s, i) => (
                    <span key={s.key} className={cn('h-1.5 flex-1 rounded-full', i <= current ? 'bg-brand-600' : 'bg-slate-200')} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Badge tone={stageTone[stage]} dot>
                    {stageLabel[stage]}
                  </Badge>
                  <p className="shrink-0 text-xs text-slate-500">
                    Step {current + 1} of {stages.length}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </Screen>
  )
}
