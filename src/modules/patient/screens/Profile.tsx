import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronRight, Languages, LayoutGrid, LogOut, MapPin, MessageCircle, UsersRound } from 'lucide-react'
import { Avatar } from '@/components/ui/Display'
import { Toggle } from '@/components/ui/Field'
import { Modal, useToast } from '@/components/ui/Overlay'
import { cn } from '@/lib/utils'
import { useLabels } from '../components/labels'
import { Screen, TopBar } from '../components/Screen'
import { languages, translate, useI18n } from '../i18n'
import type { Language } from '../i18n'
import { usePatient } from '../PatientContext'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-bold tracking-wide text-slate-500 uppercase">{title}</h2>
      <div className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">{children}</div>
    </section>
  )
}

/** Language selection sheet: English and Hindi. The app switches as soon as one is chosen. */
function LanguageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const { lang, setLang, t } = useI18n()

  const choose = (code: Language) => {
    setLang(code)
    // confirm in the language that was just chosen
    if (code !== lang) toast(translate(code, 'lang.changed'))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} variant="sheet" title={t('lang.title')} description={t('lang.desc')}>
      <div role="radiogroup" className="space-y-2.5">
        {languages.map((language) => {
          const selected = language.code === lang
          return (
            <button
              key={language.code}
              type="button"
              role="radio"
              aria-checked={selected}
              lang={language.code}
              onClick={() => choose(language.code)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left transition ring-inset',
                selected ? 'shadow-card ring-2 ring-brand-600' : 'ring-1 ring-slate-200',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-xl text-[13px] font-extrabold tracking-wide',
                  selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {language.tag}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] leading-snug font-bold text-slate-900">{language.name}</span>
                <span className="block text-xs text-slate-500">{language.english}</span>
              </span>
              <span className={cn('grid size-5 shrink-0 place-items-center rounded-full ring-2 ring-inset', selected ? 'ring-brand-600' : 'ring-slate-300')}>
                {selected && <span className="size-2.5 rounded-full bg-brand-600" />}
              </span>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const labels = useLabels()
  const { user, members, selectedMember, addresses, whatsappOptIn, setWhatsappOptIn, logout } = usePatient()
  const [choosingLanguage, setChoosingLanguage] = useState(false)
  if (!user) return null
  const currentLanguage = languages.find((l) => l.code === lang)!

  return (
    <Screen header={<TopBar title={t('profile.title')} back="/patient" />}>
      <div className="space-y-6 px-5 py-5">
        <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">+91 {user.mobile}</p>
          </div>
        </div>

        <Group title={t('profile.family')}>
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{m.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {labels.relation(m.relation)} · {labels.memberMeta(m)}
                </p>
              </div>
              {m.id === selectedMember.id && (
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{t('common.selected')}</span>
              )}
            </div>
          ))}
          <Link to="/patient/family" className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-brand-700">
            <UsersRound className="size-[18px] shrink-0" />
            <span className="flex-1">{t('profile.manageFamily')}</span>
            <ChevronRight className="size-4 shrink-0 text-slate-300" />
          </Link>
        </Group>

        <Group title={t('profile.addresses')}>
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3">
              <MapPin className="mt-0.5 size-[18px] shrink-0 text-brand-600" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{a.label}</p>
                <p className="text-xs leading-snug text-slate-500">
                  {a.line}, {a.area}
                </p>
              </div>
            </div>
          ))}
        </Group>

        <Group title={t('profile.preferences')}>
          <button type="button" onClick={() => setChoosingLanguage(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <Languages className="size-[18px] shrink-0 text-brand-600" />
            <span className="flex-1 text-sm font-bold text-slate-900">{t('profile.language')}</span>
            <span className="shrink-0 text-sm font-semibold text-slate-500">{currentLanguage.name}</span>
            <ChevronRight className="size-4 shrink-0 text-slate-300" />
          </button>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <MessageCircle className="size-[18px] shrink-0 text-teal-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{t('profile.whatsapp')}</p>
              <p className="text-xs text-slate-500">{t('profile.whatsappHint', { mobile: user.mobile })}</p>
            </div>
            <Toggle checked={whatsappOptIn} onChange={setWhatsappOptIn} label={t('profile.whatsapp')} />
          </div>
        </Group>

        <Group title={t('profile.prototype')}>
          <Link to="/" className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-900">
            <LayoutGrid className="size-[18px] shrink-0 text-slate-500" />
            <span className="flex-1">{t('profile.switch')}</span>
            <ChevronRight className="size-4 shrink-0 text-slate-300" />
          </Link>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/patient/login', { replace: true })
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-bold text-red-600"
          >
            <LogOut className="size-[18px] shrink-0" />
            {t('profile.logout')}
          </button>
        </Group>
      </div>

      <LanguageSheet open={choosingLanguage} onClose={() => setChoosingLanguage(false)} />
    </Screen>
  )
}
