import { Tabs } from '@/components/ui/Tabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CitationChip } from '@/components/ui/Citation'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { formatBytes, formatDate } from '@/utils/format'
import { documentById } from '@/data/documents'
import { useState } from 'react'

type Tab = 'evidence' | 'sources' | 'meta' | 'related'

export function ContextPanel() {
  const ws = useWorkspace()
  const [tab, setTab] = useState<Tab>('meta')
  const doc = ws.selected
  const effective: Tab =
    ws.evidenceList.length && (tab === 'meta' || ws.lastResult) && ws.view === 'assistant'
      ? tab === 'meta'
        ? 'evidence'
        : tab
      : tab

  return (
    <div className="p-4">
      <p className="label-caps text-ice">Context</p>
      <div className="mt-3">
        <Tabs
          value={effective}
          onChange={setTab}
          items={[
            { id: 'evidence', label: 'Evidence' },
            { id: 'sources', label: 'Sources' },
            { id: 'meta', label: 'Metadata' },
            { id: 'related', label: 'Related' },
          ]}
        />
      </div>

      {effective === 'evidence' && (
        <div className="mt-4 space-y-2">
          {ws.evidenceList.length === 0 ? (
            <p className="text-sm text-fog">Ask a question to retrieve evidence.</p>
          ) : (
            ws.evidenceList.map((e, i) => (
              <CitationChip
                key={e.id}
                evidence={e}
                index={i + 1}
                active={ws.evidence?.id === e.id}
                onClick={() => ws.setEvidence(e)}
              />
            ))
          )}
        </div>
      )}

      {effective === 'sources' && (
        <ul className="mt-4 space-y-2">
          {(ws.lastResult?.relatedDocumentIds ?? []).map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => ws.openViewer(id)}
                className="w-full rounded-xl border border-line px-3 py-2 text-left text-sm text-snow hover:border-ice/30"
              >
                {documentById[id]?.title ?? id}
              </button>
            </li>
          ))}
          {!ws.lastResult && (
            <p className="text-sm text-fog">Sources appear after a grounded answer.</p>
          )}
        </ul>
      )}

      {effective === 'meta' && doc && (
        <div className="mt-4 space-y-3">
          <h2 className="text-base">{doc.title}</h2>
          <StatusBadge status={doc.status} />
          <p className="text-sm text-mist">{doc.summary}</p>
          <p className="font-mono text-[11px] text-fog">
            {formatDate(doc.modified)} · {doc.pages} pages · {doc.chunks} chunks
            <br />
            {formatBytes(doc.sizeBytes)} · health {doc.health}% (illustrative)
          </p>
          <div className="flex flex-wrap gap-1">
            {doc.topics.map((t) => (
              <span key={t} className="rounded-full border border-line px-2 py-0.5 text-[10px] text-mist">
                {t}
              </span>
            ))}
          </div>
          {doc.passages[0] && (
            <blockquote className="rounded-xl border border-line bg-void/50 p-3 text-xs leading-relaxed text-mist">
              {doc.passages[0].text}
            </blockquote>
          )}
        </div>
      )}

      {effective === 'related' && (
        <ul className="mt-4 space-y-2">
          {(doc?.passages.slice(1) ?? []).map((p) => (
            <li key={p.id} className="rounded-xl border border-line px-3 py-2 text-[12px] text-mist">
              p.{p.page} · {p.section}
            </li>
          ))}
          {(!doc || doc.passages.length < 2) && (
            <p className="text-sm text-fog">Related passages appear with a selected document.</p>
          )}
        </ul>
      )}
    </div>
  )
}
