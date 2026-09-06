import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useLenis(enabled = true) {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!enabled || reduced) return

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.12,
      touchMultiplier: 1.1,
    })

    return () => {
      lenis.destroy()
    }
  }, [enabled, reduced])
}
