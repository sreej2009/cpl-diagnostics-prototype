import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Display'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal, useToast } from '@/components/ui/Overlay'
import { cn } from '@/lib/utils'
import type { FamilyMember, Gender } from '@/types'
import { relationOptions, useLabels } from '../components/labels'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

const genders: Gender[] = ['Female', 'Male', 'Other']

interface FormState {
  /** null when adding a new member. */
  id: string | null
  name: string
  relation: string
  age: string
  gender: Gender
}

const emptyForm: FormState = { id: null, name: '', relation: 'Mother', age: '', gender: 'Female' }

/** Add / edit sheet. Only the details needed to book a test are asked for. */
function MemberForm({ form, onClose }: { form: FormState; onClose: () => void }) {
  const toast = useToast()
  const { t } = useI18n()
  const labels = useLabels()
  const { user, members, addMember, updateMember, selectMember } = usePatient()
  const [values, setValues] = useState(form)
  const [submitted, setSubmitted] = useState(false)
  const set = (patch: Partial<FormState>) => setValues((prev) => ({ ...prev, ...patch }))

  const isSelf = values.id !== null && values.id === members[0]?.id
  const nameError = values.name.trim().length < 2
  const age = Number(values.age)
  const ageError = values.age === '' || !Number.isInteger(age) || age < 0 || age > 120

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (nameError || ageError) return
    const details = { name: values.name.trim(), relation: values.relation, age, gender: values.gender }
    if (values.id) {
      updateMember(values.id, details)
      toast(t('family.updatedToast', { name: details.name }))
    } else {
      // new members share the account's mobile number for booking updates
      const created = addMember({ ...details, mobile: user?.mobile ?? '' })
      selectMember(created.id)
      toast(t('family.addedToast', { name: details.name }))
    }
    onClose()
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label={t('family.name')}>
        <Input
          value={values.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder={t('family.namePh')}
          aria-invalid={submitted && nameError}
          className={cn(submitted && nameError && 'ring-red-400')}
        />
        {submitted && nameError && <span className="mt-1.5 block text-xs font-semibold text-red-600">{t('family.errName')}</span>}
      </Field>
      <Field label={t('family.relation')}>
        <Select value={values.relation} disabled={isSelf} onChange={(e) => set({ relation: e.target.value })}>
          {relationOptions
            .filter((r) => isSelf || r !== 'Self')
            .map((r) => (
              <option key={r} value={r}>
                {labels.relation(r)}
              </option>
            ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('family.age')}>
          <Input
            value={values.age}
            onChange={(e) => set({ age: e.target.value.replace(/\D/g, '').slice(0, 3) })}
            inputMode="numeric"
            aria-invalid={submitted && ageError}
            className={cn(submitted && ageError && 'ring-red-400')}
          />
        </Field>
        <Field label={t('family.gender')}>
          <Select value={values.gender} onChange={(e) => set({ gender: e.target.value as Gender })}>
            {genders.map((g) => (
              <option key={g} value={g}>
                {labels.gender(g)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {submitted && ageError && <p className="-mt-2 text-xs font-semibold text-red-600">{t('family.errAge')}</p>}
      <Button type="submit" size="lg" block>
        <span className="truncate">{values.id ? t('family.saveChanges') : t('family.add')}</span>
      </Button>
    </form>
  )
}

export default function Family() {
  const toast = useToast()
  const { t } = useI18n()
  const labels = useLabels()
  const { members, selectedMember, selectMember, removeMember } = usePatient()
  const [form, setForm] = useState<FormState | null>(null)
  const [removing, setRemoving] = useState<FamilyMember | null>(null)

  const edit = (m: FamilyMember) => setForm({ id: m.id, name: m.name, relation: m.relation, age: String(m.age), gender: m.gender })

  const confirmRemove = () => {
    if (!removing) return
    // fall back to the account holder if the removed profile was being viewed
    if (removing.id === selectedMember.id) selectMember(members[0].id)
    removeMember(removing.id)
    toast(t('family.removedToast', { name: removing.name }))
    setRemoving(null)
  }

  return (
    <Screen
      header={<TopBar title={t('family.title')} back="/patient/profile" />}
      footer={
        <Button size="lg" block icon={Plus} onClick={() => setForm(emptyForm)}>
          <span className="truncate">{t('family.add')}</span>
        </Button>
      }
    >
      <div className="space-y-3 px-5 py-5">
        <p className="text-[13px] leading-relaxed text-slate-500">{t('family.intro')}</p>

        {members.map((member, index) => {
          const selected = member.id === selectedMember.id
          const isSelf = index === 0
          return (
            <article
              key={member.id}
              className={cn('rounded-2xl bg-white p-4 transition ring-inset', selected ? 'shadow-card ring-2 ring-brand-600' : 'shadow-card ring-1 ring-slate-200/70')}
            >
              <div className="flex items-center gap-3">
                <Avatar name={member.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-slate-900">{member.name}</p>
                  <p className="truncate text-xs text-slate-500">{labels.memberMeta(member)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                  {labels.relation(member.relation)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-dashed border-slate-200 pt-3">
                {selected ? (
                  <span className="inline-flex h-8 min-w-0 flex-1 items-center gap-1.5 text-[13px] font-bold text-brand-700">
                    <Check className="size-4 shrink-0" strokeWidth={3} />
                    <span className="truncate">{t('common.selected')}</span>
                  </span>
                ) : (
                  <span className="min-w-0 flex-1">
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => {
                        selectMember(member.id)
                        toast(t('family.nowViewing', { name: member.name }))
                      }}
                    >
                      {t('common.select')}
                    </Button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => edit(member)}
                  aria-label={`${t('common.edit')}: ${member.name}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <Pencil className="size-4" />
                </button>
                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => setRemoving(member)}
                    aria-label={`${t('common.delete')}: ${member.name}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </article>
          )
        })}

        <p className="pt-1 text-center text-xs text-slate-400">{t('common.sampleData')}</p>
      </div>

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        variant="sheet"
        title={form?.id ? t('family.editTitle') : t('family.add')}
      >
        {form && <MemberForm key={form.id ?? 'new'} form={form} onClose={() => setForm(null)} />}
      </Modal>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        variant="sheet"
        title={removing ? t('family.removeTitle', { name: removing.name }) : ''}
        description={t('family.removeBody')}
        footer={
          <>
            <Button variant="secondary" size="lg" block onClick={() => setRemoving(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="lg" block onClick={confirmRemove}>
              {t('family.remove')}
            </Button>
          </>
        }
      >
        <span />
      </Modal>
    </Screen>
  )
}
