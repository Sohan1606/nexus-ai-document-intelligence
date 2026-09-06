import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export function Logo({
  className,
  to = '/',
  wordmark = true,
}: {
  className?: string
  to?: string
  wordmark?: boolean
}) {
  return (
    <Link
      to={to}
      data-cursor="hover"
      className={cn('group flex items-center gap-2.5', className)}
      aria-label="NEXUS home"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <rect
          x="1"
          y="1"
          width="20"
          height="20"
          rx="5"
          className="stroke-line-strong group-hover:stroke-ice/50"
          strokeWidth="1"
        />
        <path
          d="M6.2 16.2V5.8h2.1l6.4 7.7V5.8h2.1v10.4h-2.1l-6.4-7.7v7.7H6.2z"
          className="fill-snow group-hover:fill-ice-bright transition-colors"
        />
        <circle cx="16.4" cy="6.2" r="1.05" className="fill-ice" />
      </svg>
      {wordmark && (
        <span className="text-[13px] font-medium tracking-[0.28em] text-snow">
          NEXUS
        </span>
      )}
    </Link>
  )
}
