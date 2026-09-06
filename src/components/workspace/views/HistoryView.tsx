import { useWorkspace } from '@/workspace/WorkspaceContext'
import { formatRelative } from '@/utils/format'

export function HistoryView() {
  const ws = useWorkspace()

  return (
    <div>
      <p className="label-caps">History</p>
      <h1 className="mt-2 text-3xl tracking-display">What you already asked.</h1>
      {ws.history.length === 0 ? (
        <p className="mt-8 text-sm text-fog">Search and ask to build a trail.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {ws.history.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
                onClick={() =>
                  h.kind === 'ask' ? void ws.ask(h.query) : void ws.runSearch(h.query)
                }
              >
                <span>
                  <span className="block text-sm text-snow">{h.query}</span>
                  <span className="font-mono text-[10px] text-fog uppercase">
                    {h.kind}
                  </span>
                </span>
                <span className="text-xs text-fog">{formatRelative(h.at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
