import { useState } from 'react'
import { Upload } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { uploadDocument, uploadStages } from '@/services/api'
import { cn } from '@/utils/cn'

export function UploadExperience() {
  const [active, setActive] = useState(-1)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState<string | null>(null)

  const run = async (file?: File) => {
    if (busy) return
    setBusy(true)
    setDone(false)
    setName(file?.name ?? 'Q4-capacity-notes.pdf')
    const fake =
      file ??
      new File(['demo'], 'Q4-capacity-notes.pdf', { type: 'application/pdf' })
    await uploadDocument(fake, (_s, i) => setActive(i))
    setDone(true)
    setBusy(false)
  }

  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Ingest</SectionLabel>
        <Reveal>
          <h2 className="mt-6 font-display text-[clamp(2.4rem,7vw,5.5rem)] tracking-display italic">
            Drop knowledge here.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <label
            className="glass-strong flex cursor-pointer flex-col items-center justify-center rounded-[28px] border-dashed px-6 py-16 text-center"
            data-cursor="hover"
          >
            <Upload className="text-ice" />
            <p className="mt-4 text-lg text-snow">Drag & drop, or browse</p>
            <p className="mt-2 text-sm text-fog">PDF · TXT · MD · DOCX conceptually</p>
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void run(f)
              }}
            />
            <button
              type="button"
              className="mt-6 rounded-full border border-line px-4 py-2 text-xs text-mist hover:text-snow"
              onClick={(e) => {
                e.preventDefault()
                void run()
              }}
            >
              Simulate a local upload
            </button>
            <div className="mt-4">
              <DemoBadge />
            </div>
          </label>
        </Reveal>

        {(active >= 0 || done) && (
          <ol className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadStages.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-sm',
                  i <= active
                    ? 'border-ice/30 text-ice-bright'
                    : 'border-line text-fog',
                )}
              >
                <span className="font-mono text-[10px] tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-1">{s.label}</p>
              </li>
            ))}
          </ol>
        )}
        {done && (
          <p className="mt-6 text-center text-sm text-mist">
            {name} indexed in the local simulation. No bytes left this browser.
          </p>
        )}
      </div>
    </section>
  )
}
