import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { timelineEvents } from '@/data/content'
import { documentById } from '@/data/documents'
import { cn } from '@/utils/cn'

const years = [2022, 2023, 2024, 2025, 2026]

export function Timeline() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = openId ? documentById[openId] : null

  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Document intelligence timeline</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            Knowledge has a date.
          </h2>
        </Reveal>

        <div className="mt-16 overflow-x-auto pb-4">
          <div className="relative min-w-[720px]">
            <div className="absolute top-6 right-0 left-0 h-px bg-line" />
            <div className="grid grid-cols-5 gap-4">
              {years.map((y) => (
                <div key={y}>
                  <p className="font-display text-3xl tracking-display text-snow">{y}</p>
                  <ul className="mt-10 space-y-3">
                    {timelineEvents
                      .filter((e) => e.year === y)
                      .map((e) => {
                        const doc = documentById[e.documentId]
                        if (!doc) return null
                        return (
                          <li key={e.id}>
                            <button
                              type="button"
                              data-cursor="hover"
                              onClick={() =>
                                setOpenId((id) => (id === doc.id ? null : doc.id))
                              }
                              onMouseEnter={() => setOpenId(doc.id)}
                              className={cn(
                                'w-full rounded-2xl border p-3 text-left transition-colors',
                                openId === doc.id
                                  ? 'border-ice/40 bg-ice/5'
                                  : 'border-line bg-panel/60 hover:border-line-strong',
                              )}
                            >
                              <p className="text-xs text-snow">{doc.title}</p>
                              <p className="mt-1 font-mono text-[10px] text-fog">
                                {doc.type.toUpperCase()} · {doc.chunks} chunks
                              </p>
                            </button>
                          </li>
                        )
                      })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="glass mt-8 rounded-2xl p-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <p className="label-caps text-ice">{open.collection}</p>
              <h3 className="mt-2 text-xl">{open.title}</h3>
              <p className="mt-2 text-sm text-mist">{open.summary}</p>
              <p className="mt-3 font-mono text-[11px] text-fog">
                {open.date} · {open.pages} pages · topics: {open.topics.join(', ')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
