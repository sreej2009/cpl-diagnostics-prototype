import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, SearchX } from 'lucide-react'
import { cardClass, FilterChips, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Avatar, EmptyState } from '@/components/ui/Display'
import { SearchInput } from '@/components/ui/Field'
import { customers } from '@/data/admin'
import type { Customer } from '@/data/admin'
import { cn, inr } from '@/lib/utils'

type Filter = 'all' | 'repeat' | 'new' | 'whatsapp'

const matches: Record<Filter, (c: Customer) => boolean> = {
  all: () => true,
  repeat: (c) => c.orders > 1,
  new: (c) => c.orders === 1,
  whatsapp: (c) => c.whatsapp,
}

export default function Customers() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const q = query.trim().toLowerCase()
  const rows = customers.filter(
    (c) =>
      matches[filter](c) &&
      (q === '' || c.name.toLowerCase().includes(q) || c.mobile.replace(/\s/g, '').includes(q.replace(/\s/g, '')) || c.area.toLowerCase().includes(q)),
  )
  const count = (f: Filter) => customers.filter(matches[f]).length

  const summary = [
    { label: 'Registered', value: '8,420' },
    { label: 'New this month', value: '386' },
    { label: 'Repeat rate', value: `${Math.round((count('repeat') / customers.length) * 100)}%` },
  ]

  return (
    <Screen
      header={
        <>
          <TopBar title="Customer Management" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white pt-3 pb-3">
            <div className="px-5">
              <SearchInput value={query} onChange={setQuery} placeholder="Search name, mobile or area" className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50" />
            </div>
            <FilterChips
              className="mt-3"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: count('all') },
                { value: 'repeat', label: 'Repeat', count: count('repeat') },
                { value: 'new', label: 'First order', count: count('new') },
                { value: 'whatsapp', label: 'WhatsApp on', count: count('whatsapp') },
              ]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-4 px-5 py-4">
        {q === '' && filter === 'all' && (
          <dl className={cn(cardClass, 'grid grid-cols-3 divide-x divide-slate-100 py-3')}>
            {summary.map((item) => (
              <div key={item.label} className="min-w-0 px-3 text-center">
                <dd className="text-[17px] font-extrabold tracking-tight text-slate-900 tabular-nums">{item.value}</dd>
                <dt className="mt-0.5 text-[11px] leading-tight font-medium text-slate-500">{item.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <p className="text-xs font-semibold text-slate-500">
          {rows.length} of the {customers.length} most recent customers
        </p>

        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No customers found" description="Try a different name, number, area or filter." />
        ) : (
          <ListGroup>
            {rows.map((c) => (
              <Link key={c.id} to={`/admin/customers/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    +91 {c.mobile} · {c.area}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-extrabold text-slate-900 tabular-nums">{inr(c.spent)}</p>
                  <p className="text-[11px] text-slate-500">
                    {c.orders} {c.orders === 1 ? 'order' : 'orders'}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </ListGroup>
        )}
      </div>
    </Screen>
  )
}
