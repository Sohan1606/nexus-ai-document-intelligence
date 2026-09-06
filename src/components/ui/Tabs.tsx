import { cn } from '@/utils/cn'

export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T
  onChange: (v: T) => void
  items: { id: T; label: string }[]
}) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-line">
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-cursor="hover"
            onClick={() => onChange(item.id)}
            className={cn(
              'relative px-3 py-2 text-[12px] tracking-wide transition-colors',
              active ? 'text-snow' : 'text-fog hover:text-mist',
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-px bg-ice" />
            )}
          </button>
        )
      })}
    </div>
  )
}
