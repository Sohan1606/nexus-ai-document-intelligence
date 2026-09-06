import { useMemo } from 'react'
import { graphEdges, graphNodes } from '@/data/content'
import { documentById } from '@/data/documents'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { cn } from '@/utils/cn'

export function GraphView() {
  const ws = useWorkspace()
  const node = graphNodes.find((n) => n.id === ws.graphNode) ?? graphNodes[0]
  const related = useMemo(() => {
    const ids = new Set<string>([node.id])
    graphEdges.forEach((e) => {
      if (e.from === node.id) ids.add(e.to)
      if (e.to === node.id) ids.add(e.from)
    })
    return ids
  }, [node.id])

  return (
    <div>
      <p className="label-caps">Graph</p>
      <h1 className="mt-2 text-3xl tracking-display">Ideas, in relation.</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-line bg-ink lg:col-span-8">
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
                <g
                  key={n.id}
                  className="cursor-pointer"
                  onClick={() => ws.setGraphNode(n.id)}
                  onMouseEnter={() => ws.setGraphNode(n.id)}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={selected ? 3.2 : 2.2}
                    className={cn(on ? 'fill-ice' : 'fill-fog', selected && 'fill-ice-bright')}
                    opacity={on ? 1 : 0.28}
                  />
                  <text
                    x={n.x}
                    y={n.y - 4.5}
                    textAnchor="middle"
                    className="fill-snow"
                    style={{ fontSize: '3px', fontFamily: 'Inter Variable, sans-serif' }}
                    opacity={on ? 1 : 0.3}
                  >
                    {n.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        <div className="lg:col-span-4">
          <p className="label-caps text-ice">{node.label}</p>
          {node.topics && (
            <p className="mt-2 text-xs text-fog">{node.topics.join(' · ')}</p>
          )}
          <ul className="mt-6 space-y-2">
            {node.documents.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => ws.openViewer(id)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-left text-sm text-snow hover:border-ice/30"
                >
                  {documentById[id]?.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
