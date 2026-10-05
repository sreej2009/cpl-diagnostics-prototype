import type { LucideIcon } from 'lucide-react'
import { Beaker, Droplet, Droplets, HeartPulse, Ribbon, Sun, TestTube, Thermometer } from 'lucide-react'
import type { TestCategory } from '@/types'

export const categoryMeta: Record<TestCategory, { icon: LucideIcon; tint: string }> = {
  Diabetes: { icon: Droplet, tint: 'bg-brand-50 text-brand-600' },
  Thyroid: { icon: Ribbon, tint: 'bg-teal-50 text-teal-600' },
  Heart: { icon: HeartPulse, tint: 'bg-rose-50 text-rose-500' },
  Liver: { icon: Beaker, tint: 'bg-amber-50 text-amber-600' },
  Kidney: { icon: Droplets, tint: 'bg-sky-50 text-sky-600' },
  Vitamins: { icon: Sun, tint: 'bg-orange-50 text-orange-500' },
  Blood: { icon: TestTube, tint: 'bg-red-50 text-red-500' },
  Fever: { icon: Thermometer, tint: 'bg-emerald-50 text-emerald-600' },
}
