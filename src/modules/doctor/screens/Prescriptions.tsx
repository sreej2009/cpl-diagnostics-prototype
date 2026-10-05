import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CircleAlert, CloudUpload, FileText, X } from 'lucide-react'
import { cardClass } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Overlay'
import { Tabs } from '@/components/ui/Tabs'
import type { Prescription } from '@/data/doctor'
import { cn } from '@/lib/utils'
import { useDoctor } from '../DoctorContext'

const statusTone: Record<Prescription['status'], BadgeTone> = {
  Received: 'amber',
  'Patient contacted': 'brand',
  'Order booked': 'green',
}

const MAX_FILE_BYTES = 5 * 1024 * 1024

export default function Prescriptions() {
  const toast = useToast()
  const [params] = useSearchParams()
  const { prescriptions, addPrescription } = useDoctor()
  const fileInput = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'new' | 'uploaded'>('new')
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [patient, setPatient] = useState(params.get('patient') ?? '')
  const [mobile, setMobile] = useState(params.get('mobile') ?? '')
  const [notes, setNotes] = useState('')
  const valid = fileName !== '' && patient.trim().length > 1 && mobile.length === 10

  // Checked locally: only photos and PDFs up to 5 MB are accepted.
  const pickFile = (file?: File) => {
    if (!file) return
    const supported = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!supported || file.size > MAX_FILE_BYTES) {
      setFileName('')
      setFileError(supported ? `${file.name} is larger than 5 MB.` : `${file.name} is not a photo or PDF.`)
      if (fileInput.current) fileInput.current.value = ''
      return
    }
    setFileError('')
    setFileName(file.name)
  }

  const clearFile = () => {
    setFileName('')
    if (fileInput.current) fileInput.current.value = ''
  }

  const submit = () => {
    setSubmitted(true)
    if (!valid) return
    setSubmitted(false)
    addPrescription({ patient: patient.trim(), mobile: `${mobile.slice(0, 5)} ${mobile.slice(5)}`, fileName, notes: notes.trim() })
    toast(`Prescription for ${patient.trim()} sent to CPL`)
    clearFile()
    setPatient('')
    setMobile('')
    setNotes('')
    setTab('uploaded')
  }

  return (
    <Screen
      header={
        <>
          <TopBar title="Upload Prescription" back="/doctor" />
          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3">
            <Tabs
              block
              value={tab}
              onChange={setTab}
              options={[
                { value: 'new', label: 'New upload' },
                { value: 'uploaded', label: 'Uploaded', count: prescriptions.length },
              ]}
            />
          </div>
        </>
      }
      footer={
        tab === 'new' && (
          <Button size="lg" block onClick={submit}>
            Send to CPL
          </Button>
        )
      }
    >
      {tab === 'new' ? (
        <div className="space-y-4 px-5 py-5">
          <p className="text-[13px] leading-relaxed text-slate-500">
            CPL contacts the patient, books the tests and credits the referral to you.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {fileName ? (
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3.5 ring-1 ring-brand-100">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600">
                <FileText className="size-5" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{fileName}</p>
              <button type="button" aria-label="Remove file" onClick={clearFile} className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-white">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-brand-200 bg-white px-6 py-7 text-center"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <CloudUpload className="size-6" />
              </span>
              <span className="mt-3 text-sm font-bold text-slate-900">Take a photo or choose a file</span>
              <span className="mt-1 text-xs text-slate-500">JPG, PNG or PDF of the prescription</span>
            </button>
          )}

          {submitted && fileName === '' && !fileError && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              Choose a photo or PDF of the prescription.
            </p>
          )}
          {fileError && (
            <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-red-50 p-3.5 ring-1 ring-red-100">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold break-words text-red-700">{fileError}</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="mt-1 text-[13px] font-bold text-red-700 underline">
                  Choose another file
                </button>
              </div>
            </div>
          )}

          <Field label="Patient name">
            <Input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Full name" aria-invalid={submitted && patient.trim().length < 2} />
            {submitted && patient.trim().length < 2 && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter the patient's name.</span>}
          </Field>
          <Field label="Patient mobile">
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              placeholder="10-digit mobile number"
              aria-invalid={submitted && mobile.length !== 10}
            />
            {submitted && mobile.length !== 10 && <span className="mt-1.5 block text-xs font-semibold text-red-600">Enter a 10-digit mobile number.</span>}
          </Field>
          <Field label="Notes for CPL (optional)">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. fasting sample, urgent" />
          </Field>
          <p className="text-center text-xs text-slate-400">Prototype — the file is not uploaded anywhere.</p>
        </div>
      ) : (
        <div className="space-y-3 px-5 py-5">
          {prescriptions.map((p) => (
            <article key={p.id} className={cn(cardClass, 'p-4')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-slate-900">{p.patient}</p>
                  <p className="text-xs text-slate-500">
                    +91 {p.mobile} · {p.uploadedOn}
                  </p>
                </div>
                <Badge tone={statusTone[p.status]} dot>
                  {p.status}
                </Badge>
              </div>
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700">
                <FileText className="size-4 shrink-0 text-slate-400" />
                <span className="truncate">{p.fileName}</span>
              </p>
              {p.notes && <p className="mt-2 text-[13px] text-slate-500">{p.notes}</p>}
            </article>
          ))}
        </div>
      )}
    </Screen>
  )
}
