import { useEffect, useRef, useState } from 'react'
import { useScroll } from 'framer-motion'
import { knowledgeTypes } from '@/data/documents'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function Problem() {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const [p, setP] = useState(0)

  useEffect(() => {
    const unsub = scrollYProgress.on('change', setP)
    return () => unsub()
  }, [scrollYProgress])

  const s1 = clamp01((p - 0.02) / 0.18)
  const s2 = clamp01((p - 0.18) / 0.2)
  const s3 = clamp01((p - 0.4) / 0.18)
  const s4 = clamp01((p - 0.58) / 0.16)
  const s5 = clamp01((p - 0.76) / 0.18)

  return (
    <section ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <p
            className="max-w-4xl text-[clamp(2.2rem,7vw,5.4rem)] leading-[0.95] font-medium tracking-display"
            style={{ opacity: reduced ? 1 : Math.max(s1 * (1 - s4 * 0.85), 0.12) }}
          >
            Your knowledge is everywhere.
          </p>

          <ul className="mt-12 flex flex-wrap gap-3">
            {knowledgeTypes.map((item, i) => {
              const chaos = reduced ? 0 : s3
              const scatterX = (i % 2 === 0 ? -1 : 1) * chaos * (18 + i * 7)
              const scatterY = (i - 3) * chaos * 9
              const rot = (i - 4) * chaos * 7
              return (
                <li
                  key={item}
                  className="rounded-full border border-line bg-panel/80 px-4 py-2 text-sm text-mist"
                  style={{
                    opacity: Math.min(s2, 1 - s5 * 0.35),
                    transform: `translate(${scatterX}px, ${scatterY}px) rotate(${rot}deg)`,
                  }}
                >
                  {item}
                </li>
              )
            })}
          </ul>

          <div className="mt-20 space-y-4">
            <p
              className="text-[clamp(1.8rem,5vw,3.6rem)] tracking-display text-mist"
              style={{ opacity: Math.max(s4, reduced ? 1 : 0) }}
            >
              Keyword search finds words.
            </p>
            <p
              className="font-display text-[clamp(2.2rem,6vw,4.4rem)] tracking-display text-ice italic"
              style={{ opacity: Math.max(s5, reduced ? 1 : 0) }}
            >
              NEXUS finds meaning.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}
