import { motion } from 'framer-motion'
import { ragPhases } from '@/data/retrieval'
import type { RetrievalTrace as Trace } from '@/types'
import { DEMO_MODE } from '@/services/api'
import { cn } from '@/utils/cn'

export function RetrievalTrace({
  activeIndex,
  label,
  trace,
  complete,
}: {
  activeIndex: number
  label: string | null
  trace?: Trace
  complete?: boolean
}) {
  return (
    <div className="rounded-2xl border border-line bg-ink p-4">
      <div className="flex items-center justify-between">
        <p className="label-caps text-ice">Intelligence state</p>
        <span className="font-mono text-[10px] text-fog">
          {trace ? (trace.demo ? 'DEMO RETRIEVAL' : 'LOCAL RAG') : DEMO_MODE ? 'DEMO RETRIEVAL' : 'LOCAL RAG'}
        </span>
      </div>
      <ol className="mt-4 space-y-1.5">
        {ragPhases.map((p, i) => {
          const on = complete ? true : i <= activeIndex
          const current = !complete && i === activeIndex
          return (
            <li
              key={p.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 text-[12px]',
                current ? 'bg-ice/10 text-ice-bright' : on ? 'text-snow' : 'text-fog',
              )}
            >
              <span className="font-mono text-[10px] text-fog">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1">{p.label}</span>
              {current && (
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-ice"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              )}
            </li>
          )
        })}
      </ol>
      {label && !complete && (
        <p className="mt-3 font-mono text-[10px] tracking-widest text-ice uppercase">
          {label}
        </p>
      )}
      {trace && complete && (
        <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-mist">
          <div>
            <dt className="text-fog">Chunks searched</dt>
            <dd className="font-display text-2xl text-snow">{trace.chunksSearched}</dd>
          </div>
          <div>
            <dt className="text-fog">Candidates</dt>
            <dd className="font-display text-2xl text-snow">{trace.candidates}</dd>
          </div>
          <div>
            <dt className="text-fog">Retained</dt>
            <dd className="font-display text-2xl text-snow">{trace.retained}</dd>
          </div>
          <div>
            <dt className="text-fog">Documents</dt>
            <dd className="font-display text-2xl text-snow">{trace.documentsUsed}</dd>
          </div>
        </dl>
      )}
      <p className="mt-3 text-[10px] text-fog">
        {trace && !trace.demo
          ? `This-request counts${trace.llm ? ` · ${trace.llm}` : ''} · not a production SLO.`
          : 'Illustrative demo counts · not measured runtime.'}
      </p>
    </div>
  )
}
