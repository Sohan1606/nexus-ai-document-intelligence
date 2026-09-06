import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { features } from '@/data/content'
import { cn } from '@/utils/cn'

export function FeatureGrid() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Capabilities</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            The instrument, not the chatbot.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.03} className={f.span}>
              <article
                className={cn(
                  'group h-full rounded-3xl border border-line bg-panel/40 p-6 transition-colors duration-500 hover:border-ice/30 hover:bg-ice/5',
                  f.visual === 'search' && 'min-h-[240px]',
                )}
              >
                <Mini visual={f.visual} />
                <h3 className="mt-6 text-lg text-snow">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{f.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Mini({ visual }: { visual: string }) {
  if (visual === 'search') {
    return (
      <div className="rounded-full border border-line px-3 py-2 text-[11px] text-fog">
        <span className="text-ice">●</span> Ask for the idea…
      </div>
    )
  }
  if (visual === 'cite') {
    return (
      <span className="inline-flex rounded-full border border-ice/30 px-2 py-1 text-[10px] text-ice">
        Q3 · p.17
      </span>
    )
  }
  if (visual === 'compare') {
    return (
      <div className="flex gap-2 text-[10px]">
        <span className="rounded bg-ice/10 px-2 py-1 text-ice">added</span>
        <span className="rounded bg-white/5 px-2 py-1 text-fog line-through">
          removed
        </span>
      </div>
    )
  }
  if (visual === 'graph') {
    return (
      <svg width="64" height="28" aria-hidden>
        <circle cx="8" cy="14" r="3" className="fill-ice" />
        <circle cx="32" cy="8" r="3" className="fill-mist" />
        <circle cx="56" cy="18" r="3" className="fill-mist" />
        <line x1="8" y1="14" x2="32" y2="8" className="stroke-ice/40" />
        <line x1="32" y1="8" x2="56" y2="18" className="stroke-white/20" />
      </svg>
    )
  }
  return <div className="h-1 w-10 rounded-full bg-ice/40" />
}
