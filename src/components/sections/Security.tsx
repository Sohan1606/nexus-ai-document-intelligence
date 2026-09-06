import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { securityFeatures } from '@/data/content'

export function Security() {
  return (
    <section id="security" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Security</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5.2vw,4.2rem)] leading-[1.02] font-medium tracking-display">
            Your documents are not decoration.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-xl text-mist">
            This showcase does not claim certifications it does not have. It does
            show the product instincts that make document systems trustworthy.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04}>
              <article className="group relative overflow-hidden rounded-3xl border border-line bg-ink p-6">
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(154,230,240,0.12),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <p className="font-mono text-[10px] tracking-[0.22em] text-ice">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-4 text-lg text-snow">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{f.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
