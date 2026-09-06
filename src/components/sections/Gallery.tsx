import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { galleryFrames } from '@/data/content'
import { cn } from '@/utils/cn'

export function Gallery() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Product gallery</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            Surfaces, composed.
          </h2>
        </Reveal>
      </div>

      <div className="mt-14 flex gap-4 overflow-x-auto px-5 pb-6 sm:px-8 lg:grid lg:grid-cols-12 lg:overflow-visible lg:px-[max(2rem,calc((100vw-72rem)/2+2rem))]">
        {galleryFrames.map((f, i) => (
          <Reveal
            key={f.id}
            delay={i * 0.04}
            className={cn(
              'min-w-[260px] lg:min-w-0',
              i === 0 && 'lg:col-span-7 lg:row-span-2',
              i === 1 && 'lg:col-span-5',
              i === 2 && 'lg:col-span-5',
              i > 2 && 'lg:col-span-4',
            )}
          >
            <figure className="group overflow-hidden rounded-3xl border border-line bg-ink">
              <div
                className={cn(
                  'relative bg-graphite p-5',
                  i === 0 ? 'h-72 sm:h-80' : 'h-48',
                )}
              >
                <Frame id={f.id} />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(154,230,240,0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <figcaption className="flex items-baseline justify-between px-5 py-4">
                <span className="text-sm text-snow">{f.title}</span>
                <span className="text-xs text-fog">{f.caption}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Frame({ id }: { id: string }) {
  if (id === 'search') {
    return (
      <div className="rounded-2xl border border-line bg-void/70 p-4">
        <p className="label-caps text-ice">Ask</p>
        <p className="mt-3 font-display text-2xl italic">“Find Kubernetes.”</p>
      </div>
    )
  }
  if (id === 'answer') {
    return (
      <div className="space-y-2 text-xs text-mist">
        <p className="text-snow">Three risks identified.</p>
        <p>01 Cloud cost volatility</p>
        <p>02 Scaling bottlenecks</p>
        <p>03 Configuration drift</p>
      </div>
    )
  }
  if (id === 'evidence') {
    return (
      <div className="rounded-xl border border-ice/20 bg-ice/5 p-4 text-xs">
        <p className="text-ice">SIM 0.94</p>
        <p className="mt-2 text-mist">
          Cloud infrastructure expenditure increased 18%…
        </p>
      </div>
    )
  }
  if (id === 'compare') {
    return (
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg border border-line p-3 text-fog">2024 VPN</div>
        <div className="rounded-lg border border-ice/30 p-3 text-ice">2025 IAP</div>
      </div>
    )
  }
  if (id === 'explorer') {
    return (
      <ul className="space-y-2 text-[11px] text-mist">
        <li className="flex justify-between border-b border-line pb-2 text-snow">
          Q3 Infrastructure Review <span className="font-mono text-fog">PDF</span>
        </li>
        <li className="flex justify-between border-b border-line pb-2">
          Zero Trust Notes <span className="font-mono text-fog">MD</span>
        </li>
        <li className="flex justify-between">
          Kubernetes Operations <span className="font-mono text-fog">PDF</span>
        </li>
      </ul>
    )
  }
  if (id === 'graph') {
    return (
      <svg viewBox="0 0 160 80" className="h-full w-full" aria-hidden>
        <line x1="30" y1="40" x2="80" y2="20" className="stroke-ice/40" />
        <line x1="80" y1="20" x2="130" y2="48" className="stroke-white/20" />
        <line x1="30" y1="40" x2="80" y2="64" className="stroke-white/20" />
        <circle cx="30" cy="40" r="5" className="fill-ice" />
        <circle cx="80" cy="20" r="4" className="fill-snow" />
        <circle cx="130" cy="48" r="4" className="fill-mist" />
        <circle cx="80" cy="64" r="4" className="fill-mist" />
      </svg>
    )
  }
  if (id === 'timeline') {
    return (
      <div className="flex h-full items-end gap-3 px-2">
        {[40, 55, 48, 78, 62].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-ice/20" style={{ height: `${h}%` }} />
        ))}
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-line text-[11px] text-mist">
      Drop knowledge here
    </div>
  )
}
