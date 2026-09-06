import { useState } from 'react'
import { DEMO_MODE, uploadDocument, uploadStages } from '@/services/api'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatBytes } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { UploadResult } from '@/types'

export function UploadDialog() {
  const { uploadOpen, setUploadOpen, refreshDocs } = useWorkspace()
  const [idx, setIdx] = useState(-1)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)

  if (!uploadOpen) return null

  const run = async (file?: File) => {
    setError(null)
    setResult(null)
    const f =
      file ??
      new File(
        ['<!-- page: 1 section: Note -->\nLocal notebook: the indigo spool protocol is a retrieval drill.\n'],
        'local-notes.md',
        { type: 'text/markdown' },
      )
    setName(f.name)
    try {
      const res = await uploadDocument(f, (_s, i) => setIdx(i))
      setResult(res)
      if (!res.demo) await refreshDocs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingest failed. Try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-void/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload"
        className="glass-strong w-full max-w-md rounded-3xl p-6"
      >
        <p className="label-caps text-ice">Drop knowledge here</p>
        <p className="mt-3 text-sm text-mist">
          {DEMO_MODE
            ? 'Local simulation of read → parse → chunk → embed → index. Nothing leaves this browser.'
            : 'PDF, Markdown, or text is parsed, chunked by page, embedded, and added to the local FAISS index.'}
        </p>
        <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line py-10 text-sm text-mist">
          {name ?? 'Browse PDF, Markdown, or text'}
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.txt,.md"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void run(f)
            }}
          />
        </label>
        <button
          type="button"
          className="mt-3 w-full text-xs text-fog underline-offset-4 hover:underline"
          onClick={() => void run()}
        >
          {DEMO_MODE ? 'Simulate ingest without a file' : 'Index a sample markdown note'}
        </button>
        <div className="mt-4">
          <DemoBadge label={DEMO_MODE ? 'Prototype mode' : 'Local RAG'} />
        </div>
        {idx >= 0 && (
          <ol className="mt-4 grid grid-cols-3 gap-2">
            {uploadStages.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  'rounded-lg border px-2 py-2 text-[11px]',
                  i <= idx ? 'border-ice/30 text-ice' : 'border-line text-fog',
                )}
              >
                {s.label}
              </li>
            ))}
          </ol>
        )}
        {result && (
          <div className="mt-4 rounded-2xl border border-ice/20 bg-ice/5 p-4 text-sm">
            <p className="text-snow">{result.name}</p>
            <p className="mt-2 font-mono text-[11px] text-mist">
              Indexed · {result.chunks} chunks · {result.sections} sections · ~
              {result.estimatedPages} pages · {formatBytes(result.sizeBytes)}
            </p>
            <p className="mt-2 text-[11px] text-fog">
              {result.demo
                ? 'Demo processing · local prototype'
                : `Local index updated${result.documentId ? ` · ${result.documentId}` : ''}`}
            </p>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <button
          type="button"
          className="mt-6 text-xs text-fog"
          onClick={() => {
            setUploadOpen(false)
            setIdx(-1)
            setResult(null)
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
