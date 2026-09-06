import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { policyChanges } from '@/data/content'
import { cn } from '@/utils/cn'

const kindStyle = {
  added: 'border-ice/30 bg-ice/5 text-ice-bright',
  removed: 'border-line text-fog line-through',
  changed: 'border-ember/30 bg-ember/5 text-ember',
  unchanged: 'border-line text-mist',
} as const

export function MultiDocument() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Multi-document intelligence</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            12 documents.
            <span className="text-mist"> 1 query.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-xl font-display text-2xl tracking-display text-ice italic">
            “What changed between the 2024 and 2025 security policies?”
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="rounded-3xl border border-line bg-panel p-6">
              <p className="label-caps">2024 policy</p>
              <h3 className="mt-3 text-xl text-snow">Perimeter, VPN, annual review</h3>
              <p className="mt-4 text-sm leading-relaxed text-mist">
                Corporate VPN required. 12-character passwords. Annual access
                reviews. Firewall as the primary network control.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="rounded-3xl border border-ice/20 bg-ice/5 p-6">
              <p className="label-caps text-ice">2025 policy</p>
              <h3 className="mt-3 text-xl text-snow">Identity-aware, continuous, encrypted</h3>
              <p className="mt-4 text-sm leading-relaxed text-mist">
                Identity-aware proxy. Device posture and SSO. Passkeys preferred.
                Continuous review. Encryption at rest on every document store.
              </p>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {policyChanges.map((c) => (
              <li
                key={c.topic}
                className={cn('rounded-2xl border px-4 py-3', kindStyle[c.kind])}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase">
                  {c.kind}
                </p>
                <p className="mt-1 text-sm">{c.topic}</p>
                <p className="mt-1 text-xs opacity-80">
                  {c.from && c.to && c.kind === 'changed'
                    ? `${c.from} → ${c.to}`
                    : c.to ?? c.from}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
