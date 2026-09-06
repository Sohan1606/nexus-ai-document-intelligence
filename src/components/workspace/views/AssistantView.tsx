import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { AnswerWithCitations, CitationChip } from '@/components/ui/Citation'
import { RetrievalTrace } from '@/components/workspace/RetrievalTrace'
import { recommendedQueries } from '@/data/chat'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { cn } from '@/utils/cn'

export function AssistantView() {
  const ws = useWorkspace()
  const [draft, setDraft] = useState('')

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 lg:flex-row lg:max-w-none">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label-caps">Assistant</p>
            <h1 className="mt-2 text-3xl tracking-display">Ask with a trail.</h1>
          </div>
          <button
            type="button"
            onClick={() => void ws.saveCurrent()}
            disabled={!ws.lastResult}
            className="rounded-full border border-line px-3 py-1.5 text-[11px] text-mist hover:text-snow disabled:opacity-30"
          >
            <Bookmark size={12} className="mr-1 inline" /> Save answer
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {ws.turns.length === 0 && (
            <p className="font-display text-3xl tracking-display text-fog italic">
              Query → retrieve → rerank → evidence → answer.
            </p>
          )}
          {ws.turns.map((t) => (
            <div key={t.id}>
              <p className="label-caps mb-2">{t.role === 'user' ? 'You' : 'NEXUS'}</p>
              {t.role === 'assistant' ? (
                <>
                  <AnswerWithCitations
                    text={t.content}
                    citations={t.citations ?? []}
                    onCite={(e) => ws.setEvidence(e)}
                    activeId={ws.evidence?.id}
                  />
                  {(!t.citations || t.citations.length === 0) && (
                    <p className="mt-2 text-[12px] text-fog">
                      No indexed evidence was retained for this answer.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-snow">{t.content}</p>
              )}
              {t.bullets && (
                <ol className="mt-3 space-y-1 text-sm text-snow">
                  {t.bullets.map((b, i) => (
                    <li key={b}>
                      {i + 1}. {b}
                    </li>
                  ))}
                </ol>
              )}
              {t.citations && t.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.citations.map((c, i) => (
                    <CitationChip
                      key={c.id}
                      evidence={c}
                      index={i + 1}
                      active={ws.evidence?.id === c.id}
                      onClick={() => ws.setEvidence(c)}
                    />
                  ))}
                </div>
              )}
              {t.claims && t.claims.length > 0 && (
                <ul className="mt-4 space-y-1">
                  {t.claims.map((c) => (
                    <li
                      key={c.id}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-[12px]',
                        c.supported
                          ? 'border-ice/20 text-snow'
                          : 'border-line text-fog line-through',
                      )}
                    >
                      {c.supported ? 'Supported' : 'Unsupported'} — {c.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <form
          className="sticky bottom-0 mt-8 bg-void pt-3 pb-2"
          onSubmit={(e) => {
            e.preventDefault()
            const q = draft.trim()
            if (!q) return
            setDraft('')
            void ws.ask(q)
          }}
        >
          <div className="flex gap-2 rounded-full border border-line bg-ink px-3 py-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a grounded question…"
              className="flex-1 bg-transparent text-sm outline-none"
              disabled={ws.busy}
            />
            <button
              type="submit"
              disabled={ws.busy}
              className="rounded-full bg-snow px-3 py-1.5 text-xs text-void disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recommendedQueries.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void ws.ask(q)}
                className="rounded-full border border-line px-3 py-1 text-[11px] text-fog hover:text-snow"
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className="w-full shrink-0 lg:w-80">
        <RetrievalTrace
          activeIndex={ws.stageIndex}
          label={ws.stageLabel}
          trace={ws.lastResult?.trace}
          complete={Boolean(ws.lastResult) && !ws.busy}
        />
        {ws.lastResult?.comparison && (
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-ice/30 px-4 py-3 text-left text-sm text-ice"
            onClick={() => ws.setView('compare')}
          >
            Open side-by-side comparison →
          </button>
        )}
      </div>
    </div>
  )
}
