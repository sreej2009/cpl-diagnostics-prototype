import { useState } from 'react'
import { CircleCheck, Plus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { doctorProfile } from '@/data/doctor'
import type { Gender } from '@/types'
import { relationOptions, useLabels } from '../../components/labels'
import { OptionCard } from '../../components/OptionCard'
import { useI18n } from '../../i18n'
import { usePatient } from '../../PatientContext'
import type { StepProps } from './types'

const genders: Gender[] = ['Female', 'Male', 'Other']

function NewPatientForm({ onSaved, onCancel }: { onSaved: (id: string) => void; onCancel: () => void }) {
  const { t } = useI18n()
  const labels = useLabels()
  const { addMember, user } = usePatient()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('Female')
  const [relation, setRelation] = useState('Spouse')
  const [mobile, setMobile] = useState(user?.mobile ?? '')
  const [submitted, setSubmitted] = useState(false)
  const nameError = name.trim().length < 2
  const ageError = !(Number(age) > 0 && Number(age) < 120)
  const mobileError = mobile.replace(/\D/g, '').length !== 10
  const valid = !nameError && !ageError && !mobileError

  const save = () => {
    setSubmitted(true)
    if (valid) onSaved(addMember({ name: name.trim(), age: Number(age), gender, relation, mobile }).id)
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <Field label={t('book.patientName')}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('book.fullName')} aria-invalid={submitted && nameError} />
        {submitted && nameError && <span className="mt-1.5 block text-xs font-semibold text-red-600">{t('family.errName')}</span>}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('book.age')}>
          <Input
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
            inputMode="numeric"
            placeholder={t('book.years')}
          />
        </Field>
        <Field label={t('book.gender')}>
          <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            {genders.map((g) => (
              <option key={g} value={g}>
                {labels.gender(g)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('book.relation')}>
          <Select value={relation} onChange={(e) => setRelation(e.target.value)}>
            {relationOptions
              .filter((r) => r !== 'Self')
              .map((r) => (
                <option key={r} value={r}>
                  {labels.relation(r)}
                </option>
              ))}
          </Select>
        </Field>
        <Field label={t('book.mobile')}>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" placeholder={t('book.tenDigits')} />
        </Field>
      </div>
      {submitted && (ageError || mobileError) && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {ageError ? t('family.errAge') : t('book.errMobile')}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" block onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button block onClick={save}>
          <span className="truncate">{t('book.savePatient')}</span>
        </Button>
      </div>
    </div>
  )
}

export function PatientStep({ draft, update }: StepProps) {
  const { t } = useI18n()
  const labels = useLabels()
  const { members } = usePatient()
  const [adding, setAdding] = useState(false)
  const code = draft.referralCode.trim().toUpperCase()
  const codeMatches = code === doctorProfile.referralCode

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.whoFor')}</h2>
        <div role="radiogroup" className="space-y-3">
          {members.map((member) => (
            <OptionCard
              key={member.id}
              selected={draft.memberId === member.id}
              onSelect={() => update({ memberId: member.id })}
              icon={UserRound}
              title={member.name}
              tag={labels.relation(member.relation)}
              description={`${labels.memberMeta(member)} · +91 ${member.mobile}`}
            />
          ))}
        </div>
        <div className="mt-3">
          {adding ? (
            <NewPatientForm
              onCancel={() => setAdding(false)}
              onSaved={(id) => {
                update({ memberId: id })
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
              {t('book.addPatient')}
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-[17px] font-bold tracking-tight text-slate-900">{t('book.referredQ')}</h2>
        <p className="mb-3 text-[13px] text-slate-500">{t('book.referredHint')}</p>
        <Input
          value={draft.referralCode}
          onChange={(e) => update({ referralCode: e.target.value })}
          placeholder={doctorProfile.referralCode}
          className="font-semibold tracking-wide uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case"
        />
        {codeMatches && (
          <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-teal-700">
            <CircleCheck className="size-4 shrink-0" />
            {t('book.referredBy', { name: doctorProfile.name })}
          </p>
        )}
        {code !== '' && !codeMatches && (
          <p className="mt-2 text-xs text-slate-500">{t('book.referralDemo', { code: doctorProfile.referralCode })}</p>
        )}
      </section>
    </div>
  )
}
