import { useMemo, useState } from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { graphEdges, graphNodes } from '@/data/content'
import { documentById } from '@/data/documents'
import { cn } from '@/utils/cn'

export function KnowledgeGraph() {
  const [active, setActive] = useState<string | null>('cloud')
  const node = graphNodes.find((n) => n.id === active) ?? graphNodes[0]
  const related = useMemo(() => {
    const ids = new Set<string>([node.id])
    graphEdges.forEach((e) => {
      if (e.from === node.id) ids.add(e.to)
      if (e.to === node.id) ids.add(e.from)
    })
    return ids
  }, [node.id])

  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Interactive knowledge graph</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            Ideas, in relation.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-line bg-ink">
              <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Concept graph">
                {graphEdges.map((e) => {
                  const a = graphNodes.find((n) => n.id === e.from)
                  const b = graphNodes.find((n) => n.id === e.to)
                  if (!a || !b) return null
                  const on = related.has(e.from) && related.has(e.to)
                  return (
                    <line
                      key={`${e.from}-${e.to}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      className={on ? 'stroke-ice/50' : 'stroke-white/10'}
                      strokeWidth="0.35"
                    />
                  )
                })}
                {graphNodes.map((n) => {
                  const on = related.has(n.id)
                  const selected = n.id === node.id
                  return (
                    <g key={n.id}>
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={selected ? 3.2 : 2.2}
                        className={cn(
                          on ? 'fill-ice' : 'fill-fog',
                          selected && 'fill-ice-bright',
                        )}
                        opacity={on ? 1 : 0.28}
                      />
                      <text
                        x={n.x}
                        y={n.y - 4.5}
                        textAnchor="middle"
                        className="fill-snow"
                        style={{ fontSize: '3.2px', fontFamily: 'Inter Variable, sans-serif' }}
                        opacity={on ? 1 : 0.3}
                      >
                        {n.label}
                      </text>
                    </g>
                  )
                })}
              </svg>
              <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
                {graphNodes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    data-cursor="hover"
                    onMouseEnter={() => setActive(n.id)}
                    onFocus={() => setActive(n.id)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-[11px]',
                      n.id === node.id
                        ? 'border-ice/40 bg-ice/10 text-ice-bright'
                        : 'border-line text-mist hover:text-snow',
                    )}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="label-caps text-ice">{node.label}</p>
            <p className="mt-3 text-sm text-mist">
              Associated documents in the demo corpus. Hover a concept to dim the rest.
            </p>
            <ul className="mt-6 space-y-2">
              {node.documents.map((id) => (
                <li
                  key={id}
                  className="rounded-xl border border-line px-3 py-2 text-sm text-snow"
                >
                  {documentById[id]?.title}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
