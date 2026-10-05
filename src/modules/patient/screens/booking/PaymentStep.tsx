import { Banknote, CalendarDays, CreditCard, MapPin, Smartphone, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Field, Input } from '@/components/ui/Field'
import { OptionCard } from '../../components/OptionCard'
import { useI18n } from '../../i18n'
import { BillSummary } from '../Cart'
import type { StepProps } from './types'

interface PaymentStepProps extends StepProps {
  /** Resolved, human-readable booking details for the review block. */
  summary: { where: string; when: string; who: string }
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug font-semibold text-slate-900">{value}</p>
      </div>
    </li>
  )
}

export function PaymentStep({ draft, update, summary }: PaymentStepProps) {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.review')}</h2>
        <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
          <SummaryRow
            icon={MapPin}
            label={draft.collectionType === 'home' ? t('home.homeCollection') : t('home.visitLab')}
            value={summary.where}
          />
          <SummaryRow icon={CalendarDays} label={t('book.dateTime')} value={summary.when} />
          <SummaryRow icon={UserRound} label={t('book.patient')} value={summary.who} />
        </ul>
      </section>

      <BillSummary />

      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.paymentMethod')}</h2>
        <div role="radiogroup" className="space-y-3">
          <OptionCard
            selected={draft.paymentMethod === 'upi'}
            onSelect={() => update({ paymentMethod: 'upi' })}
            icon={Smartphone}
            title={t('pay.upi')}
            description={t('book.upiDesc')}
          >
            <Field label={t('book.upiId')}>
              <Input placeholder="name@bank" defaultValue="priya.raman@okaxis" />
            </Field>
          </OptionCard>
          <OptionCard
            selected={draft.paymentMethod === 'card'}
            onSelect={() => update({ paymentMethod: 'card' })}
            icon={CreditCard}
            title={t('book.card')}
            description={t('book.cardDesc')}
          >
            <div className="space-y-3">
              <Field label={t('book.cardNumber')}>
                <Input placeholder="0000 0000 0000 0000" inputMode="numeric" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('book.expiry')}>
                  <Input placeholder="MM / YY" inputMode="numeric" />
                </Field>
                <Field label="CVV">
                  <Input placeholder="•••" inputMode="numeric" type="password" />
                </Field>
              </div>
            </div>
          </OptionCard>
          <OptionCard
            selected={draft.paymentMethod === 'cod'}
            onSelect={() => update({ paymentMethod: 'cod' })}
            icon={Banknote}
            title={t('book.cod')}
            description={draft.collectionType === 'home' ? t('book.codHome') : t('book.codLab')}
          />
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">{t('book.noRealPayment')}</p>
      </section>
    </div>
  )
}
