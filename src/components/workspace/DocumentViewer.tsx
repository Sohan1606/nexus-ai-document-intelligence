import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react'
import type { DocumentRecord } from '@/types'
import { Field } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatBytes, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

export function DocumentViewer({
  doc,
  page,
  highlight,
  onPage,
  onClose,
}: {
  doc: DocumentRecord
  page: number
  highlight?: string
  onPage: (n: number) => void
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [q, setQ] = useState('')

  const passage =
    (highlight &&
      doc.passages.find(
        (p) => p.page === page && p.text.toLowerCase().includes(highlight.toLowerCase()),
      )) ||
    doc.passages.find((p) => p.page === page)
  const matches = useMemo(() => {
    if (!q.trim()) return []
    const n = q.toLowerCase()
    return doc.passages.filter(
      (p) => p.text.toLowerCase().includes(n) || p.section.toLowerCase().includes(n),
    )
  }, [q, doc.passages])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="label-caps text-ice">{doc.collection}</p>
          <h1 className="truncate text-lg tracking-display">{doc.title}</h1>
        </div>
        <StatusBadge status={doc.status} />
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-mist hover:bg-white/5"
          aria-label="Close viewer"
        >
          <X size={16} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="custom-scroll hidden w-52 shrink-0 overflow-y-auto border-r border-line p-3 md:block">
          <p className="label-caps px-2">Sections</p>
          <ul className="mt-2 space-y-1">
            {doc.passages.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPage(p.page)}
                  className={cn(
                    'w-full rounded-lg px-2 py-1.5 text-left text-[12px]',
                    p.page === page ? 'bg-white/8 text-snow' : 'text-mist hover:text-snow',
                  )}
                >
                  p.{p.page} · {p.section}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 px-2 font-mono text-[10px] text-fog">
            {formatBytes(doc.sizeBytes)} · {doc.pages} pages · {doc.chunks} chunks
            <br />
            {formatDate(doc.modified)}
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
            <button
              type="button"
              className="rounded-full border border-line px-2 py-1 text-xs disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-[11px] text-mist">
              {page} / {doc.pages}
            </span>
            <button
              type="button"
              className="rounded-full border border-line px-2 py-1 text-xs disabled:opacity-30"
              disabled={page >= doc.pages}
              onClick={() => onPage(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className="rounded-full p-1 text-mist"
                onClick={() => setZoom((z) => Math.max(0.85, z - 0.1))}
                aria-label="Zoom out"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-[10px] text-fog">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="rounded-full p-1 text-mist"
                onClick={() => setZoom((z) => Math.min(1.35, z + 0.1))}
                aria-label="Zoom in"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="custom-scroll flex-1 overflow-y-auto bg-graphite p-4 sm:p-8">
            <article
              className="mx-auto min-h-[520px] max-w-[640px] rounded-sm bg-[#f4f1ea] p-10 text-[#1a1915] shadow-[0_30px_80px_-40px_black]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#6a675e]">
                {doc.title.toUpperCase()} · PAGE {page}
              </p>
              {passage ? (
                <>
                  <h2 className="mt-6 font-serif text-2xl">{passage.section}</h2>
                  <p className="mt-6 text-[15px] leading-relaxed">
                    <Highlight text={passage.text} needle={highlight || q} />
                  </p>
                </>
              ) : (
                <p className="mt-10 text-sm leading-relaxed text-[#6a675e]">
                  This page has no stored passage yet. Open a cited page to see retrieved text.
                </p>
              )}
            </article>
          </div>
        </div>

        <aside className="hidden w-64 shrink-0 border-l border-line p-4 lg:block">
          <p className="label-caps">Find in document</p>
          <Field
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search passages…"
            className="mt-3"
          />
          <ul className="mt-4 space-y-2">
            {matches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onPage(m.page)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-left text-[12px] text-mist hover:text-snow"
                >
                  p.{m.page} · {m.section}
                </button>
              </li>
            ))}
          </ul>
          {q && matches.length === 0 && (
            <p className="mt-4 text-xs text-fog">No passage matches.</p>
          )}
        </aside>
      </div>
    </div>
  )
}

function Highlight({ text, needle }: { text: string; needle?: string }) {
  if (!needle?.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(needle.toLowerCase())
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#9ae6f0]/50">{text.slice(idx, idx + needle.length)}</mark>
      {text.slice(idx + needle.length)}
    </>
  )
}
