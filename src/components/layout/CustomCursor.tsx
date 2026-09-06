import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function CustomCursor() {
  const desktop = useIsDesktop()
  const reduced = usePrefersReducedMotion()
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 })

  useEffect(() => {
    if (!desktop || reduced) return
    document.documentElement.classList.add('cursor-none-desktop')

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      const interactive = t?.closest(
        'a, button, [data-cursor="hover"], input, textarea, [role="button"]',
      )
      setHover(Boolean(interactive))
    }
    const leave = () => setVisible(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    document.addEventListener('mouseleave', leave)
    return () => {
      document.documentElement.classList.remove('cursor-none-desktop')
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.removeEventListener('mouseleave', leave)
    }
  }, [desktop, reduced, x, y])

  if (!desktop || reduced) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[80] mix-blend-difference"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <div
        className="relative -translate-x-1/2 -translate-y-1/2"
        style={{
          width: hover ? 44 : 12,
          height: hover ? 44 : 12,
          transition: 'width 0.28s cubic-bezier(0.16,1,0.3,1), height 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="absolute inset-0 rounded-full border border-white/80" />
        <div className="absolute inset-[40%] rounded-full bg-white" />
      </div>
    </motion.div>
  )
}
