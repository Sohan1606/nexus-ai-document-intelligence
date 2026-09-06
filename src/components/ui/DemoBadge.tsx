import { cn } from '@/utils/cn'

export function DemoBadge({ className, label }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-ice/20 bg-ice/5 px-2.5 py-1 text-[10px] tracking-[0.18em] text-ice uppercase',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-ice animate-pulse-soft" />
      {label ?? 'Prototype mode'}
    </span>
  )
}
