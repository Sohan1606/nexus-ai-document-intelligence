import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import {
  Bookmark,
  FileText,
  Folder,
  GitCompare,
  History,
  MessageSquare,
  Network,
  Search,
  Upload,
  Waypoints,
} from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { documents } from '@/data/documents'
import { commandPrompts } from '@/data/chat'
import { Kbd } from '@/components/ui/Kbd'
import { cn } from '@/utils/cn'

type Item = {
  id: string
  group: string
  label: string
  hint?: string
  icon: typeof Search
  run: () => void
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const go = (path: string) => {
    setOpen(false)
    if (path.startsWith('#')) {
      void navigate('/' + path)
      return
    }
    void navigate(path)
  }

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        keys: ['title', 'topics', 'summary'],
        threshold: 0.4,
      }),
    [],
  )

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const commands: Item[] = [
      { id: 'cmd-ws', group: 'Go', label: 'Open workspace', icon: Waypoints, run: () => go('/workspace') },
      { id: 'cmd-search', group: 'Go', label: 'Search documents', icon: Search, run: () => go('/workspace?view=search') },
      { id: 'cmd-ask', group: 'Go', label: 'Ask NEXUS', icon: MessageSquare, run: () => go('/workspace?view=assistant') },
      { id: 'cmd-up', group: 'Go', label: 'Upload document', icon: Upload, run: () => go('/workspace?view=documents&upload=1') },
      { id: 'cmd-col', group: 'Go', label: 'Open collections', icon: Folder, run: () => go('/workspace?view=collections') },
      { id: 'cmd-saved', group: 'Go', label: 'View saved answers', icon: Bookmark, run: () => go('/workspace?view=saved') },
      { id: 'cmd-hist', group: 'Go', label: 'Search history', icon: History, run: () => go('/workspace?view=history') },
      { id: 'cmd-cmp', group: 'Go', label: 'Compare 2024 / 2025 policies', icon: GitCompare, run: () => go('/workspace?view=compare') },
      { id: 'cmd-graph', group: 'Go', label: 'Knowledge graph', icon: Network, run: () => go('/workspace?view=graph') },
      { id: 'cmd-arch', group: 'Go', label: 'Show architecture', icon: Waypoints, run: () => go('/#how-it-works') },
    ]

    const prompts: Item[] = commandPrompts.map((p) => ({
      id: `ask-${p}`,
      group: 'Ask',
      label: p,
      icon: MessageSquare,
      run: () => go(`/workspace?view=assistant&q=${encodeURIComponent(p)}`),
    }))

    const docs: Item[] = (q ? fuse.search(q).slice(0, 5).map((r) => r.item) : documents.slice(0, 4)).map(
      (d) => ({
        id: `doc-${d.id}`,
        group: 'Documents',
        label: d.title,
        hint: d.type.toUpperCase(),
        icon: FileText,
        run: () => go(`/workspace?view=viewer&doc=${d.id}`),
      }),
    )

    const pool = [...commands, ...prompts, ...docs]
    if (!q) return pool
    return pool.filter(
      (i) =>
        i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q),
    )
  }, [query, fuse])

  useEffect(() => {
    setActive(0)
  }, [query, open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(items.length - 1, i + 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      items[active]?.run()
    }
  }

  const groups = [...new Set(items.map((i) => i.group))]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-void/70 px-4 pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="glass-strong w-full max-w-2xl overflow-hidden rounded-3xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)]"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search size={18} className="text-ice" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="What are you looking for?"
                className="w-full bg-transparent text-lg text-snow outline-none placeholder:text-fog"
                aria-label="Command query"
                aria-activedescendant={items[active]?.id}
              />
              <Kbd>ESC</Kbd>
            </div>

            <div className="custom-scroll max-h-[52vh] overflow-y-auto p-3">
              {items.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-fog">
                  Nothing in the demo corpus matches.
                </p>
              )}
              {groups.map((g) => (
                <div key={g} className="mb-2">
                  <p className="label-caps px-3 py-2">{g}</p>
                  <ul>
                    {items
                      .filter((i) => i.group === g)
                      .map((item) => {
                        const i = items.indexOf(item)
                        return (
                          <li key={item.id} id={item.id}>
                            <button
                              type="button"
                              onMouseEnter={() => setActive(i)}
                              onClick={() => item.run()}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm',
                                i === active
                                  ? 'bg-white/8 text-snow'
                                  : 'text-mist hover:bg-white/5 hover:text-snow',
                              )}
                              data-cursor="hover"
                            >
                              <item.icon size={15} className="shrink-0 text-ice" />
                              <span className="flex-1">{item.label}</span>
                              {item.hint && (
                                <span className="font-mono text-[10px] text-fog">
                                  {item.hint}
                                </span>
                              )}
                            </button>
                          </li>
                        )
                      })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] text-fog">
              <span>Local simulation · no network</span>
              <span className="hidden gap-2 sm:flex">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <Kbd>↵</Kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
