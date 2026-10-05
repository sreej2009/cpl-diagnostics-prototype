import { useState } from 'react'
import { CircleCheck, Clock, MapPin } from 'lucide-react'
import { cardClass, ListGroup } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, EmptyState } from '@/components/ui/Display'
import { Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Overlay'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import type { Order, Phlebotomist } from '@/types'
import { useAdmin } from '../AdminContext'

const availability: Record<Phlebotomist['status'], { label: string; tone: BadgeTone }> = {
  available: { label: 'Available', tone: 'green' },
  'on-job': { label: 'On a collection', tone: 'brand' },
  'off-duty': { label: 'Off duty', tone: 'neutral' },
}

function AssignCard({ order }: { order: Order }) {
  const toast = useToast()
  const { phlebotomists, assignPhlebotomist } = useAdmin()
  const onDuty = phlebotomists.filter((p) => p.status !== 'off-duty')
  const [choice, setChoice] = useState(onDuty.find((p) => p.status === 'available')?.id ?? onDuty[0].id)

  const assign = () => {
    assignPhlebotomist(order.id, choice)
    toast(`${phlebotomists.find((p) => p.id === choice)?.name} assigned to ${order.id}`)
  }

  return (
    <article className={cn(cardClass, 'p-4')}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-[15px] font-bold text-slate-900">{order.patient.name}</p>
        <p className="shrink-0 text-xs font-bold tracking-wide text-slate-500">{order.id}</p>
      </div>
      <p className="mt-0.5 truncate text-[13px] text-slate-600">{order.items.map((i) => i.name).join(', ')}</p>
      <div className="mt-2.5 space-y-1 text-xs font-medium text-slate-500">
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            {order.location}, {order.area}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0 text-slate-400" />
          {order.date} · {order.slot}
        </p>
      </div>
      <div className="mt-3 flex gap-2 border-t border-dashed border-slate-200 pt-3 max-[360px]:flex-col">
        <Select value={choice} onChange={(e) => setChoice(e.target.value)} className="min-w-0 flex-1" aria-label="Phlebotomist">
          {onDuty.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.zone.split(' · ')[0]}
            </option>
          ))}
        </Select>
        <Button className="h-11" onClick={assign}>
          Assign
        </Button>
      </div>
    </article>
  )
}

export default function Assign() {
  const { orders, phlebotomists } = useAdmin()
  const [tab, setTab] = useState<'queue' | 'roster'>('queue')
  const unassigned = orders.filter((o) => o.status === 'placed' && o.collectionType === 'home')
  const openJobs = (id: string) => orders.filter((o) => o.phlebotomistId === id && o.status === 'assigned').length

  return (
    <Screen
      header={
        <TabHeader title="Phlebotomist Assignment" subtitle="Assign home sample collections">
          <div className="mt-4 px-5">
            <Tabs
              block
              value={tab}
              onChange={setTab}
              options={[
                { value: 'queue', label: 'To assign', count: unassigned.length },
                { value: 'roster', label: 'Phlebotomists', count: phlebotomists.length },
              ]}
            />
          </div>
        </TabHeader>
      }
    >
      <div className="space-y-3 px-5 py-4">
        {tab === 'queue' ? (
          unassigned.length === 0 ? (
            <EmptyState icon={CircleCheck} title="All collections are assigned" description="New home collection orders will appear here." />
          ) : (
            unassigned.map((order) => <AssignCard key={order.id} order={order} />)
          )
        ) : (
          <ListGroup>
            {phlebotomists.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{p.name}</p>
                  <p className="truncate text-xs text-slate-500">{p.zone}</p>
                  <p className="text-xs text-slate-500">
                    {openJobs(p.id)} assigned · {p.completedToday} done today
                  </p>
                </div>
                <Badge tone={availability[p.status].tone} dot>
                  {availability[p.status].label}
                </Badge>
              </div>
            ))}
          </ListGroup>
        )}
      </div>
    </Screen>
  )
}
