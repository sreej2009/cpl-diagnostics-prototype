import { useState } from 'react'
import { CheckCheck, CircleAlert, Clock, Eye, FileText, Send } from 'lucide-react'
import { cardClass, StatTile } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, useToast } from '@/components/ui/Overlay'
import { cn } from '@/lib/utils'
import { useAdmin, useAdminState } from '../AdminContext'

type Delivery = 'not-sent' | 'sent' | 'delivered' | 'read' | 'failed'

const deliveryMeta: Record<Delivery, { label: string; tone: BadgeTone }> = {
  'not-sent': { label: 'Not sent', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'brand' },
  delivered: { label: 'Delivered', tone: 'teal' },
  read: { label: 'Read', tone: 'green' },
  failed: { label: 'Failed', tone: 'red' },
}

/** Delivery state for reports released before this session. Anything else starts as "not sent". */
const seedDelivery: Record<string, Delivery> = {
  'CPL-24790': 'read',
  'CPL-24781': 'delivered',
  'CPL-24772': 'failed',
}

export default function WhatsAppReports() {
  const toast = useToast()
  const { orders } = useAdmin()
  const [delivery, setDelivery] = useAdminState('whatsapp.delivery', seedDelivery)
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState(false)

  const released = orders.filter((o) => o.status === 'reported')
  const stateOf = (id: string): Delivery => delivery[id] ?? 'not-sent'
  const canSend = (id: string) => stateOf(id) === 'not-sent' || stateOf(id) === 'failed'
  const sendable = released.filter((o) => canSend(o.id)).map((o) => o.id)
  const countOf = (d: Delivery) => released.filter((o) => stateOf(o.id) === d).length
  const allSelected = sendable.length > 0 && sendable.every((id) => selected.includes(id))

  const send = (ids: string[]) => {
    if (ids.length === 0) return
    const mark = (state: Delivery) => setDelivery((prev) => ({ ...prev, ...Object.fromEntries(ids.map((id) => [id, state])) }))
    mark('sent')
    setSelected((prev) => prev.filter((id) => !ids.includes(id)))
    toast(ids.length === 1 ? `Report ${ids[0]} sent on WhatsApp` : `${ids.length} reports sent on WhatsApp`)
    // simulate the delivery receipt
    window.setTimeout(() => mark('delivered'), 1800)
  }

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <Screen
      header={
        <TopBar
          title="WhatsApp Report Sending"
          back="/admin/more"
          right={
            <button type="button" aria-label="Preview message" onClick={() => setPreview(true)} className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10">
              <Eye className="size-5" />
            </button>
          }
        />
      }
      footer={
        <Button size="lg" block icon={Send} disabled={selected.length === 0} onClick={() => send(selected)}>
          {selected.length > 0 ? `Send ${selected.length} on WhatsApp` : 'Select reports to send'}
        </Button>
      }
    >
      <div className="space-y-4 px-5 py-5">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Ready to send" value={String(countOf('not-sent'))} icon={Clock} tone="amber" />
          <StatTile label="Delivered" value={String(countOf('delivered') + countOf('read'))} icon={CheckCheck} tone="teal" />
          <StatTile label="Failed" value={String(countOf('failed'))} icon={CircleAlert} tone="slate" />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 px-1 text-[13px] font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={allSelected}
            disabled={sendable.length === 0}
            onChange={() => setSelected(allSelected ? [] : sendable)}
            className="size-[18px] accent-brand-600"
          />
          Select all to send ({countOf('not-sent')} unsent{countOf('failed') > 0 ? ` + ${countOf('failed')} failed` : ''})
        </label>

        <div className="space-y-3">
          {released.map((o) => {
            const state = stateOf(o.id)
            const sendableNow = canSend(o.id)
            return (
              <label key={o.id} className={cn(cardClass, 'flex items-start gap-3 p-4', sendableNow && 'cursor-pointer')}>
                <input
                  type="checkbox"
                  aria-label={`Select ${o.id}`}
                  checked={selected.includes(o.id)}
                  disabled={!sendableNow}
                  onChange={() => toggle(o.id)}
                  className="mt-1 size-[18px] shrink-0 accent-brand-600 disabled:opacity-30"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-[15px] font-bold text-slate-900">{o.patient.name}</p>
                    <Badge tone={deliveryMeta[state].tone} dot>
                      {deliveryMeta[state].label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-slate-500">{o.items.map((i) => i.name).join(', ')}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {o.id} · +91 {o.patient.mobile}
                  </p>
                  {state === 'failed' && <p className="mt-1.5 text-xs font-semibold text-red-600">Number is not on WhatsApp — retry or call the patient.</p>}
                </div>
              </label>
            )
          })}
        </div>
        <p className="text-center text-xs text-slate-400">Prototype — messages are simulated.</p>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} variant="sheet" title="Message preview" description="Template sent with every report">
        <div className="rounded-2xl bg-[#e9f5ee] p-4">
          <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-white p-3 shadow-card">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200/70">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500">
                <FileText className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">CPL-Report-{'{order_id}'}.pdf</p>
                <p className="text-[11px] text-slate-500">PDF</p>
              </div>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-slate-700">
              Hello {'{patient_name}'}, your CPL Diagnostics report for {'{tests}'} is ready. You can also view it any time
              in the CPL app.
            </p>
            <p className="mt-1 text-right text-[10px] text-slate-400">CPL Diagnostics</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          The live system sends through the WhatsApp Business API; that integration is not part of this prototype.
        </p>
      </Modal>
    </Screen>
  )
}
