import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { engineeringPrinciples } from '@/data/content'

export function Engineering() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Engineering</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            Principles, not vanity metrics.
          </h2>
        </Reveal>
        <div className="mt-14 divide-y divide-line border-y border-line">
          {engineeringPrinciples.map((p) => (
            <Reveal key={p.kicker}>
              <article className="grid gap-4 py-10 lg:grid-cols-12">
                <p className="label-caps lg:col-span-3">{p.kicker}</p>
                <div className="lg:col-span-9">
                  <h3 className="text-2xl tracking-display">{p.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
                    {p.copy}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-xs text-fog">
          Illustrative principles. No production latency, accuracy, or user counts
          are claimed.
        </p>
      </div>
    </section>
  )
}
