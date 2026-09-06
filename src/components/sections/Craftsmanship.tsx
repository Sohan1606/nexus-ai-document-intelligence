import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { craftDetails } from '@/data/content'

export function Craftsmanship() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Materials</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5.4vw,4.4rem)] leading-[1.02] font-medium tracking-display">
            Crafted down to the pixel.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-xl text-mist">
            Luxury, translated into software: type, hairlines, glass, citation
            marks, motion that knows when to stop.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {craftDetails.map((d) => (
            <article key={d.title} className="bg-void p-8">
              <h3 className="font-display text-3xl tracking-display italic">
                {d.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-mist">{d.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-ink p-8 sm:p-12">
          <p className="label-caps text-ice">Macro</p>
          <p className="mt-6 font-display text-[clamp(2.4rem,8vw,6rem)] leading-[0.9] tracking-display">
            NEXUS
          </p>
          <p className="mt-4 max-w-md text-sm text-mist">
            Tracking, optical size, ice on charcoal. The wordmark is a material.
          </p>
        </div>
      </div>
    </section>
  )
}
