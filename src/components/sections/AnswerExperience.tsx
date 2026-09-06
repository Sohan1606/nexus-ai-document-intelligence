import { useState } from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { AnswerWithCitations, CitationChip } from '@/components/ui/Citation'
import { EvidenceInspector } from '@/components/ui/EvidenceInspector'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { promptScripts } from '@/data/chat'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Evidence } from '@/types'

const script = promptScripts[0]

export function AnswerExperience() {
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const sheet = useMediaQuery('(max-width: 1023px)')
  const list = script.result.citations

  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>The answer</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            Grounded language.
            <span className="mt-2 block font-display font-normal text-mist italic">
              Every claim can be opened.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="glass-strong mx-auto max-w-3xl rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="label-caps">Conversation</p>
              <DemoBadge />
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-raised/60 px-4 py-3 text-sm text-snow">
              {script.prompt}
            </div>

            <div className="mt-6 space-y-4">
              <AnswerWithCitations
                text={script.result.answer}
                citations={list}
                onCite={setEvidence}
                activeId={evidence?.id}
              />
              <ol className="space-y-2">
                {script.result.bullets?.map((b, i) => (
                  <li key={b} className="flex gap-3 text-snow">
                    <span className="font-mono text-ice">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {b}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2 pt-2">
                {list.map((c, i) => (
                  <CitationChip
                    key={c.id}
                    evidence={c}
                    index={i + 1}
                    active={evidence?.id === c.id}
                    onClick={() => setEvidence(c)}
                  />
                ))}
              </div>
              <p className="pt-2 text-xs text-fog">
                Hover a marker for a preview. Click to inspect the passage.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <EvidenceInspector
        evidence={evidence}
        list={list}
        onClose={() => setEvidence(null)}
        onPrev={() => {
          const i = list.findIndex((e) => e.id === evidence?.id)
          if (i > 0) setEvidence(list[i - 1])
        }}
        onNext={() => {
          const i = list.findIndex((e) => e.id === evidence?.id)
          if (i >= 0 && i < list.length - 1) setEvidence(list[i + 1])
        }}
        variant={sheet ? 'sheet' : 'panel'}
      />
    </section>
  )
}
