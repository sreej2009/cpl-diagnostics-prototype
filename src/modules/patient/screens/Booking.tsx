import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { doctorProfile } from '@/data/doctor'
import { labCentres, timeSlots } from '@/data/patient'
import { addDays, cn, dayName, fmtDate, inr } from '@/lib/utils'
import type { CollectionType } from '@/types'
import { useLabels } from '../components/labels'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { usePatient } from '../PatientContext'
import { CollectionStep } from './booking/CollectionStep'
import { PatientStep } from './booking/PatientStep'
import { PaymentStep } from './booking/PaymentStep'
import { ScheduleStep } from './booking/ScheduleStep'
import { BOOKING_STEPS } from './booking/types'
import type { BookingDraft } from './booking/types'

const isCollectionType = (v: string | null): v is CollectionType => v === 'home' || v === 'lab'

function Stepper({ current }: { current: number }) {
  const { t } = useI18n()
  return (
    <div className="shrink-0 border-b border-slate-100 bg-white px-5 pt-3 pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-bold text-slate-900">{t(`book.step${current}` as TranslationKey)}</p>
        <p className="shrink-0 text-xs font-semibold text-slate-500">{t('sample.stepOf', { a: current, b: BOOKING_STEPS.length })}</p>
      </div>
      <ol className="mt-2 flex gap-1.5" aria-hidden="true">
        {BOOKING_STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i + 1 < current ? 'bg-teal-500' : i + 1 === current ? 'bg-brand-600' : 'bg-slate-200',
            )}
          />
        ))}
      </ol>
    </div>
  )
}

export default function Booking() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const labels = useLabels()
  const [params, setParams] = useSearchParams()
  const { cartLines, cartTotal, addresses, members, selectedMember, preferredCollection, placeOrder } = usePatient()
  const [processing, setProcessing] = useState(false)

  const step = Math.min(Math.max(Number(params.get('step')) || 1, 1), BOOKING_STEPS.length)
  const typeParam = params.get('type')

  const [draft, setDraft] = useState<BookingDraft>(() => ({
    collectionType: isCollectionType(typeParam) ? typeParam : preferredCollection,
    addressId: addresses[0]?.id ?? '',
    labId: labCentres[0].id,
    dayOffset: 1,
    slot: null,
    // start with the family member currently selected in the app
    memberId: selectedMember.id,
    referralCode: '',
    paymentMethod: 'upi',
  }))
  const update = (patch: Partial<BookingDraft>) => setDraft((prev) => ({ ...prev, ...patch }))

  // Deep links (from the feature guide) may ask for a collection type or land past the schedule step.
  useEffect(() => {
    if (isCollectionType(typeParam)) setDraft((prev) => ({ ...prev, collectionType: typeParam }))
  }, [typeParam])
  useEffect(() => {
    if (step > 2) setDraft((prev) => (prev.slot ? prev : { ...prev, slot: timeSlots[0].slots[1] }))
  }, [step])

  if (cartLines.length === 0 && !processing) return <Navigate to="/patient/cart" replace />

  const goTo = (n: number) => setParams({ step: String(n) })
  const address = addresses.find((a) => a.id === draft.addressId)
  const lab = labCentres.find((l) => l.id === draft.labId)
  const member = members.find((m) => m.id === draft.memberId)
  const date = addDays(draft.dayOffset)

  const where =
    draft.collectionType === 'home'
      ? { location: address?.line ?? '', area: address?.area ?? '' }
      : { location: lab?.name ?? '', area: lab?.address ?? '' }

  const stepValid = [
    draft.collectionType === 'home' ? Boolean(address) : Boolean(lab),
    draft.slot !== null,
    Boolean(member),
    Boolean(member) && draft.slot !== null,
  ][step - 1]

  const pay = () => {
    if (!member || !draft.slot) return
    setProcessing(true)
    const referred = draft.referralCode.trim().toUpperCase() === doctorProfile.referralCode
    window.setTimeout(() => {
      const order = placeOrder({
        collectionType: draft.collectionType,
        ...where,
        date: fmtDate(date),
        slot: draft.slot!,
        member,
        paymentMethod: draft.paymentMethod,
        referredBy: referred ? doctorProfile.name : undefined,
      })
      navigate(`/patient/confirmation/${order.id}`, { replace: true })
    }, 1400)
  }

  return (
    <Screen
      header={
        <>
          <TopBar fixed title={t('book.title')} back={step === 1 ? '/patient/cart' : () => goTo(step - 1)} />
          <Stepper current={step} />
        </>
      }
      footer={
        step < BOOKING_STEPS.length ? (
          <>
            {step === 2 && !stepValid && <p className="mb-2 text-center text-xs font-medium text-slate-500">{t('book.selectATime')}</p>}
            <Button size="lg" block disabled={!stepValid} onClick={() => goTo(step + 1)}>
              {t('common.continue')}
            </Button>
          </>
        ) : (
          <Button size="lg" block disabled={!stepValid} loading={processing} onClick={pay}>
            {processing
              ? t('book.processing')
              : draft.paymentMethod === 'cod'
                ? t('book.placeOrder', { amount: inr(cartTotal.price) })
                : t('book.pay', { amount: inr(cartTotal.price) })}
          </Button>
        )
      }
    >
      <div key={step} className="animate-rise px-5 py-5">
        {step === 1 && <CollectionStep draft={draft} update={update} />}
        {step === 2 && <ScheduleStep draft={draft} update={update} />}
        {step === 3 && <PatientStep draft={draft} update={update} />}
        {step === 4 && (
          <PaymentStep
            draft={draft}
            update={update}
            summary={{
              where: `${where.location}, ${where.area}`,
              when: `${labels.date(`${dayName(date)}, ${fmtDate(date)}`)} · ${draft.slot ?? t('book.selectATime')}`,
              who: member ? `${member.name} · ${labels.memberMeta(member)}` : '—',
            }}
          />
        )}
      </div>
    </Screen>
  )
}
