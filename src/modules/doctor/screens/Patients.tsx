import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, SearchX } from 'lucide-react'
import { ListGroup } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { Avatar, EmptyState } from '@/components/ui/Display'
import { SearchInput } from '@/components/ui/Field'
import { doctorPatients } from '@/data/doctor'

export default function Patients() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const rows = doctorPatients.filter(
    (p) => q === '' || p.name.toLowerCase().includes(q) || p.mobile.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
  )

  return (
    <Screen
      header={
        <TabHeader title="Patients" subtitle={`${doctorPatients.length} patients referred to CPL`}>
          <div className="mt-4 px-5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name or mobile"
              className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50"
            />
          </div>
        </TabHeader>
      }
    >
      <div className="px-5 py-4">
        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No patients found" description="Try a different name or number." />
        ) : (
          <ListGroup>
            {rows.map((patient) => (
              <Link key={patient.id} to={`/doctor/patients/${patient.id}`} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={patient.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-slate-900">{patient.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    +91 {patient.mobile} · Last referred {patient.lastReferred}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {patient.referrals.length}
                </span>
                <ChevronRight className="size-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </ListGroup>
        )}
      </div>
    </Screen>
  )
}
