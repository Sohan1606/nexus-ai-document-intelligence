import { useDocumentScrollProgress } from '@/hooks/useScrollProgress'

export function ScrollProgress() {
  const progress = useDocumentScrollProgress()
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[70] h-[1.5px] w-full"
      aria-hidden
    >
      <div
        className="h-full origin-left bg-ice"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
