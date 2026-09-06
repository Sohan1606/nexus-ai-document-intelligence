import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { useMousePosition } from '@/hooks/useMousePosition'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { heroFragments } from '@/data/documents'
import { cn } from '@/utils/cn'

const positions = [
  { x: -34, y: -22, z: 80, r: -12, depth: 28 },
  { x: 32, y: -28, z: 40, r: 9, depth: 18 },
  { x: -38, y: 18, z: 20, r: 6, depth: 22 },
  { x: 36, y: 22, z: 60, r: -7, depth: 16 },
  { x: -18, y: -34, z: 10, r: 4, depth: 12 },
  { x: 22, y: 34, z: 30, r: 11, depth: 20 },
  { x: -44, y: -4, z: 50, r: -5, depth: 14 },
  { x: 44, y: -6, z: 15, r: 8, depth: 10 },
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.92])
  const mouse = useMousePosition()
  const desktop = useIsDesktop()
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)

  const mx = desktop && !reduced ? (mouse.x - 0.5) * 2 : 0
  const my = desktop && !reduced ? (mouse.y - 0.5) * 2 : 0

  return (
    <section
      ref={ref}
      id="product"
      className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-16"
    >
      <div className="lab-grid mask-fade-edges pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(154,230,240,0.14),transparent_62%)]"
      />

      <motion.div style={{ opacity, scale }} className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          <DemoBadge className="mb-8" />
          <h1 className="text-[clamp(2.6rem,8vw,6.4rem)] leading-[0.92] font-medium tracking-display text-snow">
            Search beyond
            <br />
            keywords.
          </h1>
          <p className="mt-4 font-display text-[clamp(1.8rem,5vw,3.4rem)] tracking-display text-ice italic">
            Understand everything.
          </p>
          <p className="mx-auto mt-7 max-w-lg text-[15px] leading-relaxed text-mist sm:text-base">
            NEXUS turns scattered documents into a living layer of searchable
            intelligence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/workspace" magnetic>
              Enter the Workspace
              <ArrowUpRight size={16} />
            </Button>
            <Button href="#how-it-works" variant="secondary">
              See how it works
              <ArrowDown size={14} />
            </Button>
          </div>
        </div>

        <div
          className="relative mx-auto mt-16 h-[380px] max-w-5xl sm:h-[460px]"
          style={{
            perspective: '1400px',
            transform: `rotateX(${my * -4}deg) rotateY(${mx * 6}deg)`,
            transformStyle: 'preserve-3d',
            transition: reduced ? undefined : 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 hidden md:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {positions.map((p, i) => (
              <line
                key={heroFragments[i].documentId}
                x1="50"
                y1="50"
                x2={50 + p.x * 0.9}
                y2={50 + p.y * 0.9}
                className="stroke-ice/25"
                strokeWidth="0.12"
                strokeDasharray="0.7 0.9"
              />
            ))}
          </svg>

          {heroFragments.map((frag, i) => {
            const p = positions[i]
            const active = hovered === frag.documentId
            const dim = hovered && !active
            return (
              <article
                key={frag.documentId}
                data-cursor="hover"
                onMouseEnter={() => setHovered(frag.documentId)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'glass absolute hidden w-[210px] rounded-xl p-3 md:block',
                  dim && 'opacity-35',
                )}
                style={{
                  left: `${50 + p.x}%`,
                  top: `${50 + p.y}%`,
                  transform: `translate3d(calc(-50% + ${mx * p.depth}px), calc(-50% + ${my * p.depth}px), ${p.z}px) rotate(${p.r}deg)`,
                  zIndex: active ? 20 : 1,
                  transition:
                    'opacity 0.4s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
                  boxShadow: active
                    ? '0 20px 50px -20px rgba(154,230,240,0.35)'
                    : undefined,
                }}
              >
                <p className="label-caps text-[9px]">
                  {frag.title}
                </p>
                <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-mist">
                  {frag.snippet}
                </p>
                {active && (
                  <p className="mt-2 font-mono text-[10px] text-ice">
                    p.{frag.page} · {(frag.relevance * 100).toFixed(0)}% · {frag.concept}
                  </p>
                )}
              </article>
            )
          })}

          <div
            className="glass-strong glow-ice absolute top-1/2 left-1/2 z-10 w-[min(92%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5"
            style={{
              transform: `translate3d(calc(-50% + ${mx * 8}px), calc(-50% + ${my * 6}px), 120px)`,
            }}
          >
            <p className="label-caps text-ice">Ask NEXUS</p>
            <p className="mt-3 font-display text-2xl leading-snug tracking-display text-snow italic sm:text-[28px]">
              “Show me every reference to infrastructure cost optimization.”
            </p>
            <div className="mt-5 flex items-center justify-between text-[11px] text-fog">
              <span>Semantic retrieval · demo</span>
              <span className="text-ice">3 sources illuminated</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
