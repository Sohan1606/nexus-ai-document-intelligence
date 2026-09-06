import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { Evidence } from '@/types'

export function CitationChip({
  evidence,
  onClick,
  active,
  index,
}: {
  evidence: Evidence
  onClick?: () => void
  active?: boolean
  index?: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        data-cursor="hover"
        onClick={onClick}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          'group/cite inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] tracking-wide transition-colors duration-300',
          active
            ? 'border-ice/50 bg-ice/10 text-ice-bright'
            : 'border-line text-mist hover:border-ice/40 hover:text-ice-bright',
        )}
        aria-label={`Open evidence from ${evidence.documentTitle}, page ${evidence.page}`}
      >
        {typeof index === 'number' && (
          <span className="font-mono text-ice">{index}</span>
        )}
        <span className="h-1.5 w-1.5 rounded-full bg-ice" />
        <span className="max-w-[220px] truncate">
          {evidence.documentTitle} · p.{evidence.page}
        </span>
      </button>
      {open && (
        <span className="pointer-events-none absolute top-full left-0 z-30 mt-2 w-72 rounded-xl border border-line bg-ink p-3 text-left shadow-[0_20px_50px_-24px_black]">
          <span className="label-caps text-ice">Preview</span>
          <span className="mt-2 block text-[12px] leading-relaxed text-mist">
            {evidence.passage.slice(0, 180)}
            {evidence.passage.length > 180 ? '…' : ''}
          </span>
        </span>
      )}
    </span>
  )
}

export function CitationMark({
  n,
  evidence,
  onClick,
  active,
}: {
  n: number
  evidence?: Evidence
  onClick?: () => void
  active?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex align-super">
      <button
        type="button"
        data-cursor="hover"
        onClick={onClick}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          'mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-sm px-0.5 font-mono text-[10px] leading-none',
          active ? 'bg-ice text-void' : 'bg-ice/15 text-ice hover:bg-ice/30',
        )}
        aria-label={
          evidence
            ? `Citation ${n}: ${evidence.documentTitle}, page ${evidence.page}`
            : `Citation ${n}`
        }
      >
        {n}
      </button>
      {open && evidence && (
        <span className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-64 -translate-x-1/2 rounded-xl border border-line bg-ink p-3 text-left shadow-[0_20px_50px_-24px_black]">
          <span className="block text-[11px] text-snow">
            {evidence.documentTitle} · p.{evidence.page}
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed text-mist">
            {evidence.highlight}
          </span>
        </span>
      )}
    </span>
  )
}

export function AnswerWithCitations({
  text,
  citations,
  onCite,
  activeId,
}: {
  text: string
  citations: Evidence[]
  onCite?: (e: Evidence) => void
  activeId?: string
}) {
  const parts = text.split(/(\[\d+\])/g)
  return (
    <p className="text-[15px] leading-relaxed text-mist">
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/)
        if (!m) return <span key={i}>{part}</span>
        const n = Number(m[1])
        const ev = citations[n - 1]
        return (
          <CitationMark
            key={i}
            n={n}
            evidence={ev}
            active={ev?.id === activeId}
            onClick={() => ev && onCite?.(ev)}
          />
        )
      })}
    </p>
  )
}
