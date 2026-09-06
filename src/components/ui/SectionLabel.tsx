import { cn } from '@/utils/cn'

export function SectionLabel({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="h-px w-8 bg-ice/50" />
      <span className="label-caps text-ice">{children}</span>
    </div>
  )
}
