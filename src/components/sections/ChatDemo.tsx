import { useState } from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { AnswerWithCitations, CitationChip } from '@/components/ui/Citation'
import { EvidenceInspector } from '@/components/ui/EvidenceInspector'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { commandPrompts } from '@/data/chat'
import { askQuestion } from '@/services/api'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { AskResult, Evidence } from '@/types'
import { cn } from '@/utils/cn'

export function ChatDemo() {
  const [stage, setStage] = useState<string | null>(null)
  const [result, setResult] = useState<AskResult | null>(null)
  const [prompt, setPrompt] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const sheet = useMediaQuery('(max-width: 1023px)')

  const run = async (q: string) => {
    if (busy) return
    setBusy(true)
    setResult(null)
    setPrompt(q)
    const res = await askQuestion(q, (_i, _t, label) => setStage(label))
    setStage(null)
    setResult(res)
    setBusy(false)
  }

  return (
    <section id="demo" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Interactive demo</SectionLabel>
            <Reveal>
              <h2 className="mt-6 max-w-2xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
                Ask the corpus.
              </h2>
            </Reveal>
          </div>
          <DemoBadge />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="text-sm text-mist">
              Suggested prompts run a local mock RAG loop — searching, reranking,
              then generating a grounded answer from the demo set.
            </p>
            <ul className="mt-6 space-y-2">
              {commandPrompts.slice(0, 6).map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    data-cursor="hover"
                    disabled={busy}
                    onClick={() => void run(p)}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors',
                      prompt === p
                        ? 'border-ice/40 bg-ice/5 text-snow'
                        : 'border-line text-mist hover:border-line-strong hover:text-snow',
                    )}
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="glass-strong min-h-[360px] rounded-3xl p-6">
              {!prompt && (
                <p className="font-display text-3xl tracking-display text-fog italic">
                  Select a prompt to watch retrieval.
                </p>
              )}
              {prompt && (
                <p className="rounded-2xl border border-line bg-raised/50 px-4 py-3 text-sm">
                  {prompt}
                </p>
              )}
              {stage && (
                <p className="mt-6 font-mono text-xs tracking-widest text-ice uppercase">
                  {stage}
                  <span className="ml-2 text-fog">· demo retrieval</span>
                </p>
              )}
              {result && (
                <div className="mt-6 space-y-4">
                  <AnswerWithCitations
                    text={result.answer}
                    citations={result.citations}
                    onCite={setEvidence}
                    activeId={evidence?.id}
                  />
                  {result.bullets && (
                    <ul className="space-y-1 text-sm text-snow">
                      {result.bullets.map((b) => (
                        <li key={b}>— {b}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {result.citations.map((c) => (
                      <CitationChip
                        key={c.id}
                        evidence={c}
                        onClick={() => setEvidence(c)}
                        active={evidence?.id === c.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
      <EvidenceInspector
        evidence={evidence}
        list={result?.citations}
        onClose={() => setEvidence(null)}
        onPrev={() => {
          const list = result?.citations ?? []
          const i = list.findIndex((e) => e.id === evidence?.id)
          if (i > 0) setEvidence(list[i - 1])
        }}
        onNext={() => {
          const list = result?.citations ?? []
          const i = list.findIndex((e) => e.id === evidence?.id)
          if (i >= 0 && i < list.length - 1) setEvidence(list[i + 1])
        }}
        variant={sheet ? 'sheet' : 'panel'}
      />
    </section>
  )
}
