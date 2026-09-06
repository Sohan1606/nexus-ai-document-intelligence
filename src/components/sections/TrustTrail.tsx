import { useState } from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const chain = ['ANSWER', 'CLAIM', 'EVIDENCE', 'DOCUMENT', 'PAGE', 'PASSAGE']

const claims = [
  {
    text: 'Cloud cost volatility from burst GPU capacity',
    supported: true,
    document: 'Q3 Infrastructure Review',
    page: '24',
    passage:
      'Three primary risks were identified: cloud cost volatility, infrastructure scaling bottlenecks, and security configuration drift…',
  },
  {
    text: 'Infrastructure scaling bottlenecks on ingest',
    supported: true,
    document: 'Q3 Infrastructure Review',
    page: '9',
    passage:
      'Autoscaling lag during the August traffic spike created a 14-minute saturation window on the ingest tier.',
  },
  {
    text: 'Security configuration drift on GPU nodes',
    supported: true,
    document: 'Cloud Security Architecture',
    page: '44',
    passage:
      'Security configuration drift is most acute on ephemeral GPU nodes where baseline hardening is applied late.',
  },
  {
    text: 'A fabricated vendor outage last Tuesday',
    supported: false,
    document: '—',
    page: '—',
    passage: 'No retrieved passage. The claim is removed from the answer.',
  },
]

export function TrustTrail() {
  const [active, setActive] = useState(0)
  const claim = claims[active]

  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Trust the trail</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5.2vw,4.2rem)] leading-[1.02] font-medium tracking-display">
            Every useful answer should leave a trail.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-xl text-mist">
            Select a claim. Supported language stays tied to a document, a page, a
            passage. Unsupported language is struck.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <ol>
              {chain.map((step, i) => (
                <li key={step} className="flex items-stretch gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ice/30 text-[10px] tracking-widest text-ice">
                      {String(i + 1)}
                    </span>
                    {i < chain.length - 1 && (
                      <span className="w-px flex-1 bg-gradient-to-b from-ice/40 to-transparent" />
                    )}
                  </div>
                  <p className="pt-1.5 pb-8 font-mono text-xs tracking-[0.22em] text-snow">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="space-y-2">
              {claims.map((c, i) => (
                <button
                  key={c.text}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition-colors',
                    !c.supported && 'opacity-40 line-through decoration-white/30',
                    i === active
                      ? 'border-ice/40 bg-ice/5'
                      : 'border-line hover:border-line-strong',
                  )}
                >
                  <p className="text-sm text-snow">{c.text}</p>
                  <p className="mt-2 font-mono text-[10px] tracking-widest text-fog uppercase">
                    {c.supported ? `${c.document} · p.${c.page}` : 'Unsupported — removed'}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-ice/20 bg-ice/5 p-5">
              <p className="label-caps text-ice">
                {claim.supported ? 'Supporting passage' : 'No evidence'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mist">{claim.passage}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
