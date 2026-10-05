import { useState } from 'react'
import { Send } from 'lucide-react'
import { cardClass, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea, Toggle } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Overlay'
import { Tabs } from '@/components/ui/Tabs'
import { audiences, automatedAlerts, channels, sentNotifications } from '@/data/admin'
import type { SentNotification } from '@/data/admin'
import { cn, fmtDate } from '@/lib/utils'
import { useAdminState } from '../AdminContext'

type Tab = 'compose' | 'alerts' | 'sent'

/** Approximate audience sizes used for the recipient count of a new notification. */
const audienceSize: Record<SentNotification['audience'], number> = {
  'All customers': 8420,
  Doctors: 62,
  Franchises: 5,
  Phlebotomists: 6,
}

export default function Notifications() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('compose')
  const [history, setHistory] = useAdminState('notifications.sent', sentNotifications)
  const [alerts, setAlerts] = useAdminState('notifications.auto', automatedAlerts)
  const [audience, setAudience] = useState<SentNotification['audience']>(audiences[0])
  const [channel, setChannel] = useState<SentNotification['channel']>(channels[0])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const titleError = title.trim().length < 3
  const messageError = message.trim().length < 5
  const valid = !titleError && !messageError
  const recipients = audienceSize[audience]

  const send = () => {
    setSubmitted(true)
    if (!valid) return
    setSubmitted(false)
    setHistory((prev) => [{ id: `n-${Date.now()}`, title: title.trim(), audience, channel, sentOn: fmtDate(new Date()), recipients }, ...prev])
    toast(`Notification sent to ${recipients.toLocaleString('en-IN')} recipients`)
    setTitle('')
    setMessage('')
    setTab('sent')
  }

  return (
    <Screen
      header={
        <>
          <TopBar title="Notification System" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3">
            <Tabs
              block
              value={tab}
              onChange={setTab}
              options={[
                { value: 'compose', label: 'Compose' },
                { value: 'alerts', label: 'Auto alerts' },
                { value: 'sent', label: 'Sent', count: history.length },
              ]}
            />
          </div>
        </>
      }
      footer={
        tab === 'compose' && (
          <Button size="lg" block icon={Send} onClick={send}>
            Send to {recipients.toLocaleString('en-IN')} recipients
          </Button>
        )
      }
    >
      <div className="px-5 py-5">
        {tab === 'compose' && (
          <div className="space-y-4">
            <Field label="Audience">
              <Select value={audience} onChange={(e) => setAudience(e.target.value as SentNotification['audience'])}>
                {audiences.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </Field>
            <Field label="Channel">
              <Select value={channel} onChange={(e) => setChannel(e.target.value as SentNotification['channel'])}>
                {channels.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Health camp this weekend" aria-invalid={submitted && titleError} />
              {submitted && titleError && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter a title of at least 3 characters.</span>}
            </Field>
            <Field label="Message">
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write the message…" aria-invalid={submitted && messageError} />
              {submitted && messageError && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter a message of at least 5 characters.</span>}
            </Field>
            <p className="text-center text-xs text-slate-400">Prototype — nothing is actually delivered.</p>
          </div>
        )}

        {tab === 'alerts' && (
          <>
            <p className="mb-3 text-[13px] leading-relaxed text-slate-500">Sent by the system as an order moves through the workflow.</p>
            <ListGroup>
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{alert.label}</p>
                    <p className="text-xs text-slate-500">{alert.detail}</p>
                  </div>
                  <Toggle
                    checked={alert.enabled}
                    label={alert.label}
                    onChange={(enabled) => setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, enabled } : a)))}
                  />
                </div>
              ))}
            </ListGroup>
          </>
        )}

        {tab === 'sent' && (
          <div className="space-y-3">
            {history.map((n) => (
              <article key={n.id} className={cn(cardClass, 'p-4')}>
                <p className="text-[15px] leading-snug font-bold text-slate-900">{n.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {n.audience} · {n.recipients.toLocaleString('en-IN')} recipients · {n.sentOn}
                </p>
                <Badge tone="brand" className="mt-2.5">
                  {n.channel}
                </Badge>
              </article>
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
