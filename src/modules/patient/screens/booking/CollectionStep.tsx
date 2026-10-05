import { useState } from 'react'
import { Building2, Clock, House, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { labCentres } from '@/data/patient'
import { OptionCard } from '../../components/OptionCard'
import { useI18n } from '../../i18n'
import { usePatient } from '../../PatientContext'
import type { StepProps } from './types'

function NewAddressForm({ onSaved, onCancel }: { onSaved: (id: string) => void; onCancel: () => void }) {
  const { t } = useI18n()
  const { addAddress } = usePatient()
  const [label, setLabel] = useState('')
  const [line, setLine] = useState('')
  const [area, setArea] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const valid = Boolean(line.trim() && area.trim())

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <Field label={t('book.saveAs')}>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('book.saveAsPh')} />
      </Field>
      <Field label={t('book.street')}>
        <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="22, 4th Main Road" />
      </Field>
      <Field label={t('book.area')}>
        <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Kilpauk, Chennai 600010" />
      </Field>
      {submitted && !valid && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {t('book.errAddress')}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" block onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          block
          onClick={() => {
            setSubmitted(true)
            if (valid) onSaved(addAddress({ label: label.trim() || 'Other', line: line.trim(), area: area.trim() }).id)
          }}
        >
          <span className="truncate">{t('book.saveAddress')}</span>
        </Button>
      </div>
    </div>
  )
}

export function CollectionStep({ draft, update }: StepProps) {
  const { t } = useI18n()
  const { addresses } = usePatient()
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.howCollect')}</h2>
        <div role="radiogroup" className="space-y-3">
          <OptionCard
            selected={draft.collectionType === 'home'}
            onSelect={() => update({ collectionType: 'home' })}
            icon={House}
            title={t('home.homeCollection')}
            description={t('book.homeDesc')}
          />
          <OptionCard
            selected={draft.collectionType === 'lab'}
            onSelect={() => update({ collectionType: 'lab' })}
            icon={Building2}
            title={t('home.visitLab')}
            description={t('book.labDesc')}
          />
        </div>
      </section>

      {draft.collectionType === 'home' ? (
        <section>
          <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.address')}</h2>
          <div role="radiogroup" className="space-y-3">
            {addresses.map((address) => (
              <OptionCard
                key={address.id}
                selected={draft.addressId === address.id}
                onSelect={() => update({ addressId: address.id })}
                icon={MapPin}
                title={address.label}
                description={`${address.line}, ${address.area}`}
              />
            ))}
          </div>
          <div className="mt-3">
            {adding ? (
              <NewAddressForm
                onCancel={() => setAdding(false)}
                onSaved={(id) => {
                  update({ addressId: id })
                  setAdding(false)
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand-300 text-[13px] font-bold text-brand-700"
              >
                <Plus className="size-4" />
                {t('book.addAddress')}
              </button>
            )}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.chooseCentre')}</h2>
          <div role="radiogroup" className="space-y-3">
            {labCentres.map((lab) => (
              <OptionCard
                key={lab.id}
                selected={draft.labId === lab.id}
                onSelect={() => update({ labId: lab.id })}
                icon={Building2}
                title={lab.name}
                tag={lab.mainLab ? t('book.mainLab') : undefined}
                description={lab.address}
              >
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-brand-600" />
                    {t('book.away', { d: lab.distance })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-brand-600" />
                    {lab.hours}
                  </span>
                </div>
              </OptionCard>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
