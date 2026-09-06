import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export function FinalCta() {
  return (
    <section className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="text-[clamp(2.4rem,8vw,6.2rem)] leading-[0.92] font-medium tracking-display">
            Turn documents into intelligence.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 font-display text-2xl text-ice italic sm:text-4xl">
            Search less. Understand more.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/workspace" magnetic>
              Enter NEXUS
              <ArrowUpRight size={16} />
            </Button>
            <Button href="#how-it-works" variant="secondary">
              Explore the architecture
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
