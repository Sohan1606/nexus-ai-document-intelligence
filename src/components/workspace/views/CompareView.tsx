import { policyChanges } from '@/data/content'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { cn } from '@/utils/cn'
import { documentById } from '@/data/documents'

const kindStyle = {
  added: 'border-ice/30 bg-ice/5 text-ice-bright',
  removed: 'border-line text-fog',
  changed: 'border-ember/30 bg-ember/5 text-ember',
  unchanged: 'border-line text-mist',
} as const

export function CompareView() {
  const ws = useWorkspace()
  const active = policyChanges.find((c) => c.topic === ws.compareTopic) ?? null
  const a = documentById['policy-2024']
  const b = documentById['policy-2025']

  return (
    <div>
      <p className="label-caps">Multi-document</p>
      <h1 className="mt-2 text-3xl tracking-display">2024 vs 2025.</h1>
      <p className="mt-3 max-w-xl font-display text-xl text-ice italic">
        “Compare the 2024 and 2025 security policies.”
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-line p-6">
          <p className="label-caps">2024 policy</p>
          <h2 className="mt-2 text-xl">Perimeter, VPN, annual review</h2>
          <p className="mt-3 text-sm text-mist">{a?.passages[0]?.text}</p>
          <button
            type="button"
            className="mt-4 text-[11px] text-ice"
            onClick={() => ws.openViewer('policy-2024', 3)}
          >
            Open source
          </button>
        </article>
        <article className="rounded-3xl border border-ice/20 bg-ice/5 p-6">
          <p className="label-caps text-ice">2025 policy</p>
          <h2 className="mt-2 text-xl">Identity-aware, continuous, encrypted</h2>
          <p className="mt-3 text-sm text-mist">{b?.passages[0]?.text}</p>
          <button
            type="button"
            className="mt-4 text-[11px] text-ice"
            onClick={() => ws.openViewer('policy-2025', 5)}
          >
            Open source
          </button>
        </article>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {policyChanges.map((c) => (
          <li key={c.topic}>
            <button
              type="button"
              onClick={() => ws.setCompareTopic(c.topic)}
              className={cn(
                'w-full rounded-2xl border px-4 py-3 text-left',
                kindStyle[c.kind],
                ws.compareTopic === c.topic && 'ring-1 ring-ice/40',
              )}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase">{c.kind}</p>
              <p className="mt-1 text-sm">{c.topic}</p>
              <p className="mt-1 text-xs opacity-80">
                {c.from && c.to && c.kind === 'changed' ? `${c.from} → ${c.to}` : c.to ?? c.from}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line p-4">
            <p className="label-caps">Document A</p>
            <p className="mt-2 text-sm text-mist">
              {active.from ?? '—'}
            </p>
            <button
              type="button"
              className="mt-3 text-[11px] text-ice"
              onClick={() => ws.openViewer('policy-2024', 3, active.from)}
            >
              Highlight in 2024
            </button>
          </div>
          <div className="rounded-2xl border border-ice/20 bg-ice/5 p-4">
            <p className="label-caps text-ice">Document B</p>
            <p className="mt-2 text-sm text-mist">{active.to ?? '—'}</p>
            <button
              type="button"
              className="mt-3 text-[11px] text-ice"
              onClick={() => ws.openViewer('policy-2025', 5, active.to)}
            >
              Highlight in 2025
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
