import { useState } from 'react'
import { Eye, FileCheck2, FileText, FlaskConical, Upload } from 'lucide-react'
import { cardClass, FilterChips } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { Modal, useToast } from '@/components/ui/Overlay'
import { cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { useAdmin } from '../AdminContext'

type Stage = 'collected' | 'testing' | 'reported'
type Filter = 'all' | 'pending' | 'released'

const stageMeta: Record<Stage, { label: string; tone: BadgeTone }> = {
  collected: { label: 'Sample received', tone: 'amber' },
  testing: { label: 'Testing in progress', tone: 'brand' },
  reported: { label: 'Report released', tone: 'green' },
}

const isStage = (s: OrderStatus): s is Stage => s === 'collected' || s === 'testing' || s === 'reported'

export default function Reports() {
  const toast = useToast()
  const { orders, setOrderStatus } = useAdmin()
  const [filter, setFilter] = useState<Filter>('all')
  const [uploadFor, setUploadFor] = useState<Order | null>(null)
  const [attached, setAttached] = useState(false)

  const inLab = orders.filter((o) => isStage(o.status))
  const pending = inLab.filter((o) => o.status !== 'reported')
  const released = inLab.filter((o) => o.status === 'reported')
  const rows = filter === 'all' ? inLab : filter === 'pending' ? pending : released

  const closeUpload = () => {
    setUploadFor(null)
    setAttached(false)
  }

  const release = () => {
    if (!uploadFor) return
    setOrderStatus(uploadFor.id, 'reported')
    toast(`Report released for ${uploadFor.id}`)
    closeUpload()
  }

  return (
    <Screen
      header={
        <TabHeader title="Report Management" subtitle="Upload results and release reports">
          <FilterChips
            className="mt-4"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: inLab.length },
              { value: 'pending', label: 'Awaiting report', count: pending.length },
              { value: 'released', label: 'Released', count: released.length },
            ]}
          />
        </TabHeader>
      }
    >
      <div className="space-y-3 px-5 py-4">
        {rows.length === 0 ? (
          <EmptyState icon={FileCheck2} title="No reports in this view" />
        ) : (
          rows.map((o) => (
            <article key={o.id} className={cn(cardClass, 'p-4')}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold tracking-wide text-slate-500">{o.id}</p>
                {isStage(o.status) && (
                  <Badge tone={stageMeta[o.status].tone} dot>
                    {stageMeta[o.status].label}
                  </Badge>
                )}
              </div>
              <p className="mt-2 truncate text-[15px] font-bold text-slate-900">{o.patient.name}</p>
              <p className="mt-0.5 truncate text-[13px] text-slate-500">{o.items.map((i) => i.name).join(', ')}</p>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
                <p className="text-xs text-slate-500">Collected {o.date}</p>
                {o.status === 'collected' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={FlaskConical}
                    onClick={() => {
                      setOrderStatus(o.id, 'testing')
                      toast(`${o.id} moved to Lab Testing`)
                    }}
                  >
                    Start testing
                  </Button>
                ) : o.status === 'testing' ? (
                  <Button size="sm" icon={Upload} onClick={() => setUploadFor(o)}>
                    Upload report
                  </Button>
                ) : (
                  <Button size="sm" variant="soft" icon={Eye} onClick={() => toast(`Opening CPL-Report-${o.id}.pdf (demo)`, 'info')}>
                    View report
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        open={uploadFor !== null}
        onClose={closeUpload}
        variant="sheet"
        title="Upload report"
        description={uploadFor ? `${uploadFor.id} · ${uploadFor.patient.name}` : undefined}
        footer={
          <Button size="lg" block disabled={!attached} onClick={release}>
            Release report
          </Button>
        }
      >
        {attached ? (
          <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">CPL-Report-{uploadFor?.id}.pdf</p>
              <p className="text-xs text-slate-500">Ready to release</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAttached(true)}
            className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-brand-200 px-6 py-7 text-center"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Upload className="size-6" />
            </span>
            <span className="mt-3 text-sm font-bold text-slate-900">Attach the report PDF</span>
            <span className="mt-1 text-xs text-slate-500">Tap to attach a sample file</span>
          </button>
        )}
        <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
          Releasing makes the report available in the Patient App and queues it for WhatsApp delivery. In the live system,
          results arrive from the LIS; that integration is not part of this prototype.
        </p>
      </Modal>
    </Screen>
  )
}
