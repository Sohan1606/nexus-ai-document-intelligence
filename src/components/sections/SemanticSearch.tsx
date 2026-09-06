import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { documents } from '@/data/documents'
import { cn } from '@/utils/cn'

const query = 'How did infrastructure spending change over the last three quarters?'

const results = [
  {
    id: 'q3-infra',
    title: 'Q3 Infrastructure Review',
    page: 17,
    relevance: 0.94,
    concept: 'quarterly spend acceleration',
    snippet:
      'Cloud infrastructure expenditure increased 18% quarter over quarter, driven primarily by GPU burst capacity…',
  },
  {
    id: 'devops-cost',
    title: 'DevOps Cost Optimization Report',
    page: 8,
    relevance: 0.91,
    concept: 'idle capacity vs demand',
    snippet:
      'Infrastructure spending rose 6% in Q1, 9% in Q2, and 18% in Q3. The acceleration is not linear demand.',
  },
  {
    id: 'reliability',
    title: 'Engineering Reliability Report',
    page: 22,
    relevance: 0.71,
    concept: 'index expansion cost',
    snippet:
      'p95 retrieval latency rose from 42ms to 67ms after the Q2 index expansion…',
  },
]

const funnel = [
  { n: 100, label: 'documents' },
  { n: 32, label: 'relevant passages' },
  { n: 8, label: 'high-confidence sources' },
  { n: 3, label: 'answer sources' },
]

export function SemanticSearch() {
  const [active, setActive] = useState(results[0].id)
  const others = useMemo(
    () => documents.filter((d) => !results.some((r) => r.id === d.id)).slice(0, 5),
    [],
  )

  return (
    <section id="intelligence" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Semantic retrieval</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5.4vw,4.4rem)] leading-[1.02] font-medium tracking-display">
            Ask for the idea.
            <span className="mt-2 block font-display font-normal text-ice italic">
              Not the exact sentence.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" delay={0.1}>
            <div className="glass-strong rounded-3xl p-5 sm:p-7">
              <p className="label-caps text-ice">Query</p>
              <p className="mt-4 font-display text-2xl leading-snug tracking-display italic sm:text-3xl">
                “{query}”
              </p>
              <svg
                className="mt-8 h-16 w-full overflow-visible"
                viewBox="0 0 640 64"
                aria-hidden
              >
                {results.map((r, i) => (
                  <g key={r.id}>
                    <line
                      x1="24"
                      y1="8"
                      x2={120 + i * 180}
                      y2="56"
                      className={cn(
                        'animate-dash stroke-ice/40',
                        active === r.id ? 'stroke-ice' : 'stroke-white/15',
                      )}
                      strokeWidth="1"
                      strokeDasharray="4 6"
                    />
                  </g>
                ))}
              </svg>
              <ul className="space-y-3">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      data-cursor="hover"
                      onMouseEnter={() => setActive(r.id)}
                      onFocus={() => setActive(r.id)}
                      className={cn(
                        'w-full rounded-2xl border p-4 text-left transition-colors duration-300',
                        active === r.id
                          ? 'border-ice/40 bg-ice/5'
                          : 'border-line bg-void/40 hover:border-line-strong',
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm text-snow">{r.title}</p>
                        <p className="font-mono text-[11px] text-ice">
                          {(r.relevance * 100).toFixed(0)}%
                        </p>
                      </div>
                      <p className="mt-1 font-mono text-[10px] tracking-widest text-fog uppercase">
                        Page {r.page} · {r.concept}
                      </p>
                      <p className="mt-2 text-[13px] leading-relaxed text-mist">
                        {r.snippet}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.18}>
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-mist">
                Documents are evaluated, then filtered. Meaning survives. Noise
                recedes. This funnel is a demonstration of retrieval, not a live
                index measurement.
              </p>
              <ol className="space-y-4">
                {funnel.map((step, i) => (
                  <li key={step.label} className="flex items-end gap-4">
                    <motion.span
                      className="font-display text-5xl tracking-display text-snow sm:text-6xl"
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                    >
                      {step.n}
                    </motion.span>
                    <span className="mb-2 text-sm text-mist">{step.label}</span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                {others.map((d) => (
                  <span
                    key={d.id}
                    className="rounded-full border border-line px-3 py-1 text-[11px] text-fog line-through decoration-white/20"
                  >
                    {d.title}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
