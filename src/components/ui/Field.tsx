import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Field({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-full border border-line bg-ink px-4 py-2.5 text-sm text-snow outline-none placeholder:text-fog focus:border-ice/40',
        className,
      )}
      {...props}
    />
  )
}
