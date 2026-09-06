import { cn } from '@/utils/cn'

export function Kbd({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <kbd
      className={cn(
        'rounded border border-line bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-fog',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
