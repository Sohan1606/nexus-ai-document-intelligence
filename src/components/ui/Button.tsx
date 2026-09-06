import { Link } from 'react-router-dom'
import type { ReactNode, MouseEvent } from 'react'
import { useRef } from 'react'
import { cn } from '@/utils/cn'
import { useIsDesktop } from '@/hooks/useMediaQuery'

type Variant = 'primary' | 'secondary' | 'ghost'

interface Common {
  children: ReactNode
  className?: string
  variant?: Variant
  magnetic?: boolean
}

type ButtonProps = Common &
  (
    | { to: string; href?: never; onClick?: never; type?: never }
    | { href: string; to?: never; onClick?: never; type?: never }
    | {
        to?: never
        href?: never
        onClick?: (e: MouseEvent<HTMLButtonElement>) => void
        type?: 'button' | 'submit'
      }
  )

const styles: Record<Variant, string> = {
  primary:
    'bg-snow text-void hover:bg-ice-bright shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_40px_-18px_rgba(154,230,240,0.45)]',
  secondary:
    'bg-transparent text-snow hairline hover:border-ice/40 hover:text-ice-bright',
  ghost: 'bg-transparent text-mist hover:text-snow',
}

export function Button({
  children,
  className,
  variant = 'primary',
  magnetic = false,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const desktop = useIsDesktop()

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (!magnetic || !desktop || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top - r.height / 2
    ref.current.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }

  const cls = cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-[13px] font-medium tracking-wide transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
    styles[variant],
    className,
  )

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
    </>
  )

  if ('to' in rest && rest.to) {
    return (
      <Link
        to={rest.to}
        className={cls}
        data-cursor="hover"
        ref={ref as never}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {inner}
      </Link>
    )
  }

  if ('href' in rest && rest.href) {
    return (
      <a
        href={rest.href}
        className={cls}
        data-cursor="hover"
        ref={ref as never}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type={'type' in rest && rest.type ? rest.type : 'button'}
      className={cls}
      data-cursor="hover"
      ref={ref as never}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={'onClick' in rest ? rest.onClick : undefined}
    >
      {inner}
    </button>
  )
}
