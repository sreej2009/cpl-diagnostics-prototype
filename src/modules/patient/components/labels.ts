import type { ResultLabels } from '@/components/reports/ResultRow'
import { packageById, testById } from '@/data/catalog'
import type { FamilyMember, Gender, HealthPackage, LabTest, OrderStatus, PaymentMethod, PaymentStatus, TestCategory } from '@/types'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { localContent } from '../i18n/content'

const RELATIONS = ['Self', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Other'] as const
export type Relation = (typeof RELATIONS)[number]
export const relationOptions: readonly Relation[] = RELATIONS

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CALENDAR_WORD = new RegExp(`\\b(${[...MONTHS, ...DAYS].join('|')})\\b`, 'g')

/** Translated versions of the labels and data-driven text that the shared (English) helpers provide. */
export function useLabels() {
  const { t, lang } = useI18n()
  const local = localContent[lang]

  const resultLabels: ResultLabels = {
    normal: t('flag.normal'),
    high: t('flag.high'),
    low: t('flag.low'),
    range: t('range.label'),
    below: t('range.below'),
    above: t('range.above'),
  }

  /** "Tue, 06 Oct 2026" → month and day names in the current language; numbers are left alone. */
  const date = (text: string) =>
    local
      ? text.replace(CALENDAR_WORD, (word) => {
          const month = MONTHS.indexOf(word)
          return month >= 0 ? local.months[month] : local.days[DAYS.indexOf(word)]
        })
      : text

  /** "10–12 hrs" → the same duration with a translated unit. */
  const dur = (text: string) => (local ? text.replace(/\bhrs\b/, local.hrs) : text)

  return {
    resultLabels,
    date,
    dur,
    status: (status: OrderStatus) => t(`status.${status}` as TranslationKey),
    step: (status: OrderStatus) => t(`step.${status}` as TranslationKey),
    hint: (status: OrderStatus) => t(`hint.${status}` as TranslationKey),
    gender: (gender: Gender) => t(`gender.${gender}` as TranslationKey),
    category: (category: TestCategory) => t(`cat.${category}` as TranslationKey),
    payMethod: (method: PaymentMethod) => t(`pay.${method}` as TranslationKey),
    payStatus: (status: PaymentStatus) => t(`payStatus.${status}` as TranslationKey),
    /** Relations added in an earlier session may be free text, so unknown ones are shown as they are. */
    relation: (relation: string) =>
      (RELATIONS as readonly string[]).includes(relation) ? t(`rel.${relation}` as TranslationKey) : relation,
    /** "34 yrs · Female" (stored on a report) → the same line in the current language. */
    meta: (text: string) =>
      text.replace(/\byrs\b/, t('common.yrs')).replace(/\b(Female|Male|Other)\b/, (g) => t(`gender.${g}` as TranslationKey)),
    memberMeta: (member: FamilyMember) => `${member.age} ${t('common.yrs')} · ${t(`gender.${member.gender}` as TranslationKey)}`,

    // Catalogue copy: names stay as they are, descriptions are translated.
    testDesc: (test: LabTest) => local?.tests[test.id] ?? test.description,
    tagline: (pkg: HealthPackage) => local?.taglines[pkg.id] ?? pkg.tagline,
    idealFor: (pkg: HealthPackage) => local?.idealFor[pkg.id] ?? pkg.idealFor,
    /** Secondary line for a cart item, built from the catalogue so it follows the language. */
    lineMeta: (line: { id: string; meta: string }) => {
      const test = testById(line.id)
      if (test) return `${local?.sample[test.sampleType] ?? test.sampleType} · ${t('test.reportIn', { time: dur(test.reportTime) })}`
      const pkg = packageById(line.id)
      if (pkg) return `${t('test.tests', { n: pkg.testIds.length })} · ${t('test.parameters', { n: pkg.parameters })}`
      return line.meta
    },
  }
}
