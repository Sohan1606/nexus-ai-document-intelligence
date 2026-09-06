import { useEffect, useRef, useState } from 'react'
import { useScroll } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { pipelineStages } from '@/data/content'
import { cn } from '@/utils/cn'

export function RagPipeline() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const [p, setP] = useState(0)

  useEffect(() => {
    const unsub = scrollYProgress.on('change', setP)
    return () => unsub()
  }, [scrollYProgress])

  const active = Math.min(
    pipelineStages.length - 1,
    Math.floor(p * pipelineStages.length),
  )
  const stage = pipelineStages[active]

  return (
    <section id="how-it-works" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex min-h-[100dvh] items-center py-24">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <SectionLabel>From document to answer</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            A retrieval trail, not a magic box.
          </h2>

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <ol className="flex gap-2 overflow-x-auto pb-2 lg:col-span-5 lg:flex-col lg:gap-1 lg:overflow-visible">
              {pipelineStages.map((s, i) => (
                <li key={s.id}>
                  <div
                    className={cn(
                      'flex min-w-[9rem] items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-500 lg:min-w-0',
                      i === active
                        ? 'border-ice/40 bg-ice/5 text-ice-bright'
                        : i < active
                          ? 'border-line text-snow'
                          : 'border-transparent text-fog',
                    )}
                  >
                    <span className="font-mono text-[10px] tracking-widest">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{s.label}</span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="glass-strong rounded-3xl p-8 lg:col-span-7">
              <p className="label-caps text-ice">{stage.label}</p>
              <h3 className="mt-4 font-display text-4xl tracking-display italic sm:text-5xl">
                {stage.title}
              </h3>
              <p className="mt-6 max-w-md text-base leading-relaxed text-mist">
                {stage.copy}
              </p>
              <p className="mt-8 font-mono text-xs tracking-widest text-fog uppercase">
                {stage.meta}
              </p>
              <div className="mt-10 h-px w-full bg-line" />
              <p className="mt-6 text-xs text-fog">
                Architecture preview · stages are illustrative of a LangChain-compatible
                retrieval graph.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
