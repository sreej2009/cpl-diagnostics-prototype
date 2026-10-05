import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { FilterChips } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { EmptyState } from '@/components/ui/Display'
import { SkeletonList, useMockLoading } from '@/components/ui/States'
import { SearchInput } from '@/components/ui/Field'
import { referrals } from '@/data/doctor'
import type { Referral } from '@/data/doctor'
import { isActive } from '@/lib/status'
import { ReferralItem } from '../components/Shared'

type Filter = 'all' | 'progress' | 'completed' | 'cancelled'

const matches: Record<Filter, (r: Referral) => boolean> = {
  all: () => true,
  progress: (r) => isActive(r.status),
  completed: (r) => r.status === 'reported',
  cancelled: (r) => r.status === 'cancelled',
}

export default function Referrals() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const loading = useMockLoading()
  const q = query.trim().toLowerCase()

  const rows = referrals.filter(
    (r) => matches[filter](r) && (q === '' || r.patient.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q)),
  )
  const count = (f: Filter) => referrals.filter(matches[f]).length

  return (
    <Screen
      header={
        <TabHeader title="Referral Tracking" subtitle="Every patient you referred and where their order is">
          <div className="mt-4 px-5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search patient or order ID"
              className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50"
            />
          </div>
          <FilterChips
            className="mt-3"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: count('all') },
              { value: 'progress', label: 'In progress', count: count('progress') },
              { value: 'completed', label: 'Completed', count: count('completed') },
              { value: 'cancelled', label: 'Cancelled', count: count('cancelled') },
            ]}
          />
        </TabHeader>
      }
    >
      <div className="space-y-3 px-5 py-4">
        {loading ? (
          <SkeletonList />
        ) : rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No referrals found" description="Try a different name or filter." />
        ) : (
          rows.map((referral) => <ReferralItem key={referral.id} referral={referral} />)
        )}
      </div>
    </Screen>
  )
}
