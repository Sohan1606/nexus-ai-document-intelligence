import { cn } from '@/utils/cn'
import { statusLabel } from '@/utils/format'
import type { DocumentStatus } from '@/types'

const styles: Record<DocumentStatus, string> = {
  ready: 'border-success/30 bg-success/10 text-success',
  indexing: 'border-ice/30 bg-ice/10 text-ice',
  processing: 'border-warning/30 bg-warning/10 text-warning',
  attention: 'border-danger/30 bg-danger/10 text-danger',
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase',
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  )
}
