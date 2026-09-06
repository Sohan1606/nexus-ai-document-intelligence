import { demoScenarios } from '@/data/chat'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/utils/format'

export function HomeView() {
  const ws = useWorkspace()
  const ready = ws.docs.filter((d) => d.status === 'ready').length

  return (
    <div>
      <p className="label-caps">Workspace</p>
      <h1 className="mt-2 text-3xl tracking-display">Document intelligence</h1>
      <p className="mt-3 max-w-xl text-sm text-mist">
        A local prototype of retrieval, citation, and inspection. Pick a scenario
        for a two-minute walkthrough.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Documents" value={String(ws.docs.length)} />
        <Stat label="Ready" value={String(ready)} />
        <Stat label="Collections" value={String(ws.collections.length)} />
        <Stat label="Indexed chunks" value="1.9k" hint="illustrative" />
      </div>

      <p className="mt-10 label-caps">Scenarios</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {demoScenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => void ws.ask(s.prompt)}
            className="rounded-full border border-line px-4 py-2 text-sm text-mist hover:border-ice/40 hover:text-snow"
            data-cursor="hover"
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-10 label-caps">Recent documents</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {ws.docs.slice(0, 6).map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => {
                ws.setSelected(d)
                ws.setView('documents')
              }}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span>
                <span className="block text-sm text-snow">{d.title}</span>
                <span className="text-xs text-fog">
                  {d.collection} · {formatDate(d.modified)}
                </span>
              </span>
              <StatusBadge status={d.status} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="label-caps">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-display">{value}</p>
      {hint && <p className="mt-1 text-[10px] text-fog">{hint}</p>}
    </div>
  )
}
