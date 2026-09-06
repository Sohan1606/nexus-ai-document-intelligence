import { Field } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { formatBytes, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import { useMemo, useState } from 'react'

export function DocumentsView() {
  const ws = useWorkspace()
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const n = q.toLowerCase()
    return ws.docs.filter(
      (d) =>
        !n ||
        d.title.toLowerCase().includes(n) ||
        d.topics.some((t) => t.toLowerCase().includes(n)),
    )
  }, [ws.docs, q])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">Library</p>
          <h1 className="mt-2 text-3xl tracking-display">Documents</h1>
        </div>
        <Field
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter titles, topics…"
          className="max-w-xs"
        />
      </div>

      {rows.length === 0 && (
        <p className="mt-10 text-sm text-fog">No documents match that filter.</p>
      )}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="font-mono text-[10px] tracking-widest text-fog uppercase">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-normal">Title</th>
              <th className="py-2 pr-3 font-normal">Status</th>
              <th className="py-2 pr-3 font-normal">Type</th>
              <th className="py-2 pr-3 font-normal">Size</th>
              <th className="py-2 pr-3 font-normal">Pages</th>
              <th className="py-2 pr-3 font-normal">Chunks</th>
              <th className="py-2 font-normal">Modified</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr
                key={d.id}
                className={cn(
                  'cursor-pointer border-b border-line hover:bg-white/3',
                  ws.selected?.id === d.id && 'bg-ice/5',
                )}
                onClick={() => ws.setSelected(d)}
                onDoubleClick={() => ws.openViewer(d.id)}
              >
                <td className="py-3 pr-3">
                  <p className="text-snow">{d.title}</p>
                  <p className="text-[11px] text-fog">{d.collection}</p>
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-mist">
                  {d.type.toUpperCase()}
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-mist">
                  {formatBytes(d.sizeBytes)}
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-mist">{d.pages}</td>
                <td className="py-3 pr-3 font-mono text-[11px] text-mist">{d.chunks}</td>
                <td className="py-3 font-mono text-[11px] text-mist">
                  {formatDate(d.modified)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-fog">Double-click a row to open the viewer.</p>
    </div>
  )
}
