import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { architectureLayers, techBadges } from '@/data/content'

export function Architecture() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Built for real intelligence</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            A stack you can actually run.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-xl text-mist">
            The UI is ready. The contracts in <code className="text-ice">src/services/api.ts</code> are
            waiting for FastAPI. FAISS is the default index — Pinecone is an optional
            reference, never required.
          </p>
        </Reveal>

        <ol className="mt-14">
          {architectureLayers.map((layer, i) => (
            <Reveal key={layer.id} delay={i * 0.03}>
              <li className="grid grid-cols-12 items-center border-t border-line py-4 last:border-b">
                <span className="col-span-2 font-mono text-[11px] text-fog">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="col-span-5 text-lg text-snow sm:text-xl">
                  {layer.label}
                </span>
                <span className="col-span-5 text-sm text-mist">{layer.detail}</span>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-2">
          {techBadges.map((b) => (
            <span
              key={b}
              className="rounded-full border border-line px-3 py-1 font-mono text-[11px] tracking-widest text-mist uppercase"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
