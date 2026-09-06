import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { openStack } from '@/data/content'

export function OpenSource() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Access</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2.1rem,5.4vw,4.4rem)] leading-[1.02] font-medium tracking-display">
            AI should be accessible.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-2xl font-display text-2xl leading-snug tracking-display text-mist italic sm:text-3xl">
            Designed to run without locking the product to a paid AI provider.
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-fog">
            NEXUS can be adapted to open-source and local infrastructure — FAISS,
            Ollama, Llama-family or other compatible models, FastAPI, LangChain,
            React, Docker. No claim is made about a specific model’s quality.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {openStack.map((s) => (
            <li
              key={s.name}
              className="rounded-2xl border border-line bg-panel/50 p-5"
            >
              <p className="text-snow">{s.name}</p>
              <p className="mt-2 text-sm text-fog">{s.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
