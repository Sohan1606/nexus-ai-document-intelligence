import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { useCommandPalette } from '@/hooks/useCommandPalette'

const links = [
  { href: '#product', label: 'Product' },
  { href: '#intelligence', label: 'Intelligence' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#demo', label: 'Demo' },
  { href: '#security', label: 'Security' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { setOpen: setPalette } = useCommandPalette()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-40 flex justify-center px-3 pt-3 transition-all duration-500 sm:px-6',
        )}
      >
        <nav
          className={cn(
            'flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500',
            scrolled
              ? 'glass-strong shadow-[0_10px_40px_-24px_rgba(0,0,0,0.8)]'
              : 'bg-transparent',
          )}
          aria-label="Primary"
        >
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  data-cursor="hover"
                  className="rounded-full px-3 py-1.5 text-[12px] tracking-wide text-mist transition-colors hover:text-snow"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setPalette(true)}
              className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[11px] text-mist md:inline-flex"
              aria-label="Open search"
            >
              <span>Search</span>
              <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-fog">
                ⌘K
              </kbd>
            </button>
            <div className="hidden sm:block">
              <Button to="/workspace" variant="primary" magnetic className="!px-4 !py-2 text-[12px]">
                Open Workspace
                <ArrowUpRight size={14} />
              </Button>
            </div>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={cn(
                  'absolute h-px w-4 bg-snow transition-transform duration-300',
                  open ? 'translate-y-0 rotate-45' : '-translate-y-1',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-4 bg-snow transition-transform duration-300',
                  open ? 'translate-y-0 -rotate-45' : 'translate-y-1',
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-end bg-void/95 px-6 pb-10 pt-28 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ul className="space-y-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block font-display text-5xl tracking-display text-snow"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-10">
              <Button to="/workspace" className="w-full">
                Open Workspace
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
