import { CitationChip } from '@/components/ui/Citation'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { formatRelative } from '@/utils/format'

export function SavedView() {
  const ws = useWorkspace()

  return (
    <div>
      <p className="label-caps">Saved</p>
      <h1 className="mt-2 text-3xl tracking-display">Answers you kept.</h1>
      {ws.saved.length === 0 ? (
        <p className="mt-8 text-sm text-fog">
          Save a grounded answer from the assistant. Stored in this session only.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {ws.saved.map((s) => (
            <li key={s.id} className="rounded-2xl border border-line p-5">
              <p className="text-sm text-snow">{s.question}</p>
              <p className="mt-2 text-sm leading-relaxed text-mist">{s.answer}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.citations.map((c) => (
                  <CitationChip
                    key={c.id}
                    evidence={c}
                    onClick={() => ws.setEvidence(c)}
                  />
                ))}
              </div>
              <p className="mt-3 font-mono text-[10px] text-fog">
                {formatRelative(s.savedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
