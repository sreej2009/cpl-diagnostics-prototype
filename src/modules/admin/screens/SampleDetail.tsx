import { Link, Navigate, useParams } from 'react-router'
import { Check, ChevronRight, Info, Undo2 } from 'lucide-react'
import { cardClass, GroupLabel } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Barcode } from '@/components/ui/Barcode'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Overlay'
import { sampleBarcode, sampleStagesFor, stageTimestamps } from '@/lib/sample'
import { cn } from '@/lib/utils'
import { useAdmin } from '../AdminContext'
import { stageLabel, stageTone } from './Samples'

export default function SampleDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { orders, sampleStage, setSampleStage, phlebotomistName } = useAdmin()
  const order = orders.find((o) => o.id === id)
  if (!order) return <Navigate to="/admin/samples" replace />

  const stage = sampleStage(order)
  const stages = sampleStagesFor(order.collectionType)
  const current = stages.findIndex((s) => s.key === stage)
  const next = stage ? stages[current + 1] : undefined
  const previous = stage ? stages[current - 1] : undefined
  const times = stage ? stageTimestamps(order, stage) : {}

  const move = (to: (typeof stages)[number]) => {
    setSampleStage(order.id, to.key)
    toast(`${sampleBarcode(order.id)} → ${to.label}`)
  }

  return (
    <Screen
      header={<TopBar title="Sample status" back="/admin/samples" />}
      footer={
        stage && (next || previous) ? (
          <div className="flex gap-3">
            {previous && (
              <Button variant="secondary" size="lg" icon={Undo2} aria-label={`Move back to ${previous.label}`} onClick={() => move(previous)}>
                <span className="max-[360px]:hidden">Undo</span>
              </Button>
            )}
            <Button size="lg" block disabled={!next} onClick={() => next && move(next)}>
              <span className="truncate">{next ? `Mark “${next.short}”` : 'Report ready'}</span>
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5 px-5 py-5">
        <div className={cn(cardClass, 'p-5')}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">Sample barcode</p>
            <p className="text-xs font-bold tracking-wide text-slate-500">{order.id}</p>
          </div>
          <Barcode value={sampleBarcode(order.id)} className="mt-3" />
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
            <Info className="mt-px size-3 shrink-0" />
            Barcode-style illustration for the prototype. It is not scannable.
          </p>
        </div>

        <div className={cn(cardClass, 'p-4')}>
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Current status</p>
          {stage ? (
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[19px] leading-snug font-extrabold tracking-tight text-slate-900">{stageLabel[stage]}</p>
              <Badge tone={stageTone[stage]} dot>
                Step {current + 1} of {stages.length}
              </Badge>
            </div>
          ) : (
            <p className="mt-1.5 rounded-xl bg-red-50 px-3.5 py-3 text-[13px] font-semibold text-red-700">
              This order was cancelled. There is no sample to track.
            </p>
          )}
        </div>

        {stage && (
          <section>
            <GroupLabel>Sample timeline</GroupLabel>
            <ol className={cn(cardClass, 'p-4')}>
              {stages.map((s, i) => {
                const done = i <= current
                return (
                  <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < stages.length - 1 && (
                      <span className={cn('absolute top-7 bottom-0 left-[13px] w-0.5', i < current ? 'bg-brand-600' : 'bg-slate-200')} />
                    )}
                    <span
                      className={cn(
                        'relative grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                        done ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400',
                        i === current && 'ring-4 ring-brand-100',
                      )}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className={cn('text-sm leading-snug font-bold', done ? 'text-slate-900' : 'text-slate-400')}>{s.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{times[s.key] ?? 'Pending'}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="mt-2 px-1 text-[11px] text-slate-400">Timestamps are sample values generated for the prototype.</p>
          </section>
        )}

        <section>
          <GroupLabel>Order</GroupLabel>
          <Link to={`/admin/orders/${order.id}`} className={cn(cardClass, 'flex items-center gap-3 p-4')}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-slate-900">{order.patient.name}</p>
              <p className="truncate text-[13px] text-slate-500">{order.items.map((i) => i.name).join(', ')}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {order.collectionType === 'home'
                  ? `Home collection · ${phlebotomistName(order.phlebotomistId) ?? 'No phlebotomist yet'}`
                  : `Lab visit · ${order.location}`}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-slate-300" />
          </Link>
        </section>
      </div>
    </Screen>
  )
}
