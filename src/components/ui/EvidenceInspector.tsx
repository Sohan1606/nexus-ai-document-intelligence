import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Copy, FileText, X } from 'lucide-react'
import type { Evidence } from '@/types'
import { DemoBadge } from './DemoBadge'
import { DEMO_MODE } from '@/services/api'
import { cn } from '@/utils/cn'

export function EvidenceInspector({
  evidence,
  list,
  onClose,
  onPrev,
  onNext,
  onOpenDocument,
  variant = 'panel',
}: {
  evidence: Evidence | null
  list?: Evidence[]
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  onOpenDocument?: (documentId: string, page: number) => void
  variant?: 'panel' | 'sheet'
}) {
  useEffect(() => {
    if (!evidence) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [evidence, onClose, onPrev, onNext])

  const idx = evidence && list ? list.findIndex((e) => e.id === evidence.id) : -1

  return (
    <AnimatePresence>
      {evidence && (
        <>
          <motion.button
            type="button"
            aria-label="Close evidence inspector"
            className="fixed inset-0 z-40 bg-void/50 lg:bg-void/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-title"
            className={cn(
              'glass-strong z-50 flex flex-col overflow-hidden',
              variant === 'sheet'
                ? 'fixed inset-x-0 bottom-0 max-h-[86vh] rounded-t-3xl'
                : 'fixed inset-y-0 right-0 h-full w-full max-w-md rounded-none border-l border-line sm:w-[440px]',
            )}
            initial={variant === 'sheet' ? { y: '100%' } : { x: 48, opacity: 0 }}
            animate={variant === 'sheet' ? { y: 0 } : { x: 0, opacity: 1 }}
            exit={variant === 'sheet' ? { y: '100%' } : { x: 48, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <p className="label-caps text-ice">Retrieved evidence</p>
                <h2
                  id="evidence-title"
                  className="mt-2 font-display text-2xl tracking-display text-snow"
                >
                  {evidence.documentTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-mist hover:bg-white/5 hover:text-snow"
                data-cursor="hover"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="custom-scroll flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <DemoBadge label={DEMO_MODE ? 'Demo retrieval' : 'Local RAG citation'} />

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Meta label="Source" value={evidence.documentTitle} />
                <Meta label="Location" value={`p.${evidence.page} · ${evidence.section}`} />
                <Meta label="Confidence" value={evidence.confidence} accent />
                <Meta
                  label="Similarity"
                  value={evidence.similarity.toFixed(2)}
                  accent
                />
              </dl>

              {evidence.prevPassage && (
                <PassageBlock label="Previous passage" text={evidence.prevPassage} muted />
              )}

              <div>
                <p className="label-caps mb-3">Excerpt</p>
                <blockquote className="rounded-2xl border border-ice/20 bg-ice/5 p-4 text-[15px] leading-relaxed text-snow/90">
                  <Highlighted text={evidence.passage} needle={evidence.highlight} />
                </blockquote>
              </div>

              {evidence.nextPassage && (
                <PassageBlock label="Next passage" text={evidence.nextPassage} muted />
              )}

              <div className="rounded-2xl border border-ice/20 bg-ice/5 p-4">
                <p className="label-caps text-ice">Retrieval</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="font-display text-4xl tracking-display text-ice-bright">
                    {evidence.similarity.toFixed(2)}
                  </span>
                  <span className="text-xs text-mist">
                    {DEMO_MODE ? 'demo similarity' : 'this-request score'}
                  </span>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-ice"
                    initial={{ width: 0 }}
                    animate={{ width: `${evidence.similarity * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
              <button
                type="button"
                className="rounded-full border border-line px-3 py-1.5 text-[11px] text-mist hover:text-snow disabled:opacity-30"
                onClick={onPrev}
                disabled={!onPrev || idx <= 0}
              >
                <ChevronLeft size={12} className="inline" /> Prev
              </button>
              <button
                type="button"
                className="rounded-full border border-line px-3 py-1.5 text-[11px] text-mist hover:text-snow disabled:opacity-30"
                onClick={onNext}
                disabled={!onNext || (list ? idx >= list.length - 1 : true)}
              >
                Next <ChevronRight size={12} className="inline" />
              </button>
              <button
                type="button"
                className="ml-auto rounded-full border border-line px-3 py-1.5 text-[11px] text-mist hover:text-snow"
                onClick={() =>
                  void navigator.clipboard.writeText(
                    `${evidence.documentTitle} · p.${evidence.page} — ${evidence.highlight}`,
                  )
                }
              >
                <Copy size={11} className="mr-1 inline" /> Copy
              </button>
              {onOpenDocument && (
                <button
                  type="button"
                  className="rounded-full bg-snow px-3 py-1.5 text-[11px] text-void"
                  onClick={() => onOpenDocument(evidence.documentId, evidence.page)}
                >
                  <FileText size={11} className="mr-1 inline" /> Open document
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className={cn('mt-1 text-sm', accent ? 'text-ice tracking-[0.14em]' : 'text-snow')}>
        {value}
      </dd>
    </div>
  )
}

function PassageBlock({
  label,
  text,
  muted,
}: {
  label: string
  text: string
  muted?: boolean
}) {
  return (
    <div>
      <p className="label-caps mb-2">{label}</p>
      <p className={cn('text-[13px] leading-relaxed', muted ? 'text-fog' : 'text-mist')}>
        {text}
      </p>
    </div>
  )
}

function Highlighted({ text, needle }: { text: string; needle: string }) {
  const idx = text.toLowerCase().indexOf(needle.toLowerCase())
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-ice/20 px-0.5 text-ice-bright">
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  )
}
