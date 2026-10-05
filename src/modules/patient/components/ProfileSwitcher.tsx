import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, UserRound, UsersRound } from 'lucide-react'
import { Avatar } from '@/components/ui/Display'
import { Modal, useToast } from '@/components/ui/Overlay'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'
import { useLabels } from './labels'
import { OptionCard } from './OptionCard'

/**
 * Bar under the screen title that shows whose orders / reports / health history
 * are on screen, and opens a sheet to switch to another family member.
 */
export function ProfileSwitcher() {
  const { t } = useI18n()
  const labels = useLabels()
  const toast = useToast()
  const { members, selectedMember, selectMember } = usePatient()
  const [open, setOpen] = useState(false)

  const choose = (id: string, name: string) => {
    selectMember(id)
    setOpen(false)
    if (id !== selectedMember.id) toast(t('family.nowViewing', { name }))
  }

  return (
    <div className="shrink-0 border-b border-slate-100 bg-white px-5 pb-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-2xl bg-brand-50 py-1.5 pr-3 pl-1.5 text-left ring-1 ring-brand-100"
      >
        <Avatar name={selectedMember.name} size="sm" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[11px] font-semibold text-brand-600">{t('family.viewing')}</span>
          <span className="block truncate text-[13px] font-bold text-slate-900">
            {selectedMember.name} · {labels.relation(selectedMember.relation)}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-brand-600" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} variant="sheet" title={t('family.switchTitle')} description={t('family.switchDesc')}>
        <div role="radiogroup" className="space-y-2.5">
          {members.map((member) => (
            <OptionCard
              key={member.id}
              selected={member.id === selectedMember.id}
              onSelect={() => choose(member.id, member.name)}
              icon={UserRound}
              title={member.name}
              tag={labels.relation(member.relation)}
              description={labels.memberMeta(member)}
            />
          ))}
        </div>
        <Link
          to="/patient/family"
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 text-[13px] font-bold text-brand-700"
        >
          <UsersRound className="size-4" />
          {t('profile.manageFamily')}
        </Link>
      </Modal>
    </div>
  )
}
