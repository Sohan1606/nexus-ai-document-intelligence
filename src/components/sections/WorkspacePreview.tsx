import { Link } from 'react-router-dom'
import { FileText, Folder, MessageSquare, Search, Bookmark } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { documents } from '@/data/documents'
import { recommendedQueries } from '@/data/chat'

const nav = [
  { icon: Folder, label: 'Workspace' },
  { icon: FileText, label: 'Documents' },
  { icon: Folder, label: 'Collections' },
  { icon: Search, label: 'Search' },
  { icon: Bookmark, label: 'Saved Answers' },
]

export function WorkspacePreview() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Product</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-medium tracking-display">
            Meet your document workspace.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-xl text-mist">
            A designed application — not a dashboard template. Open the live
            prototype to search, inspect evidence, and run a local RAG conversation.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mt-14">
          <div className="overflow-hidden rounded-[28px] border border-line-strong bg-ink shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-[11px] tracking-[0.2em] text-mist">NEXUS WORKSPACE</span>
              <span className="rounded-full border border-ice/20 px-2 py-0.5 text-[10px] tracking-widest text-ice">
                PROTOTYPE
              </span>
            </div>
            <div className="grid lg:grid-cols-[200px_1fr_240px]">
              <aside className="hidden border-r border-line p-4 lg:block">
                <ul className="space-y-1">
                  {nav.map((n, i) => (
                    <li
                      key={n.label}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${i === 1 ? 'bg-white/5 text-snow' : 'text-mist'}`}
                    >
                      <n.icon size={14} />
                      {n.label}
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="p-5">
                <div className="flex items-center gap-2 rounded-full border border-line bg-void px-4 py-2.5 text-sm text-fog">
                  <Search size={14} className="text-ice" />
                  Ask the corpus…
                  <span className="ml-auto font-mono text-[10px]">⌘K</span>
                </div>
                <p className="mt-6 label-caps">Recent documents</p>
                <ul className="mt-3 space-y-2">
                  {documents.slice(0, 5).map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-xl border border-line px-3 py-2"
                    >
                      <span className="text-sm text-snow">{d.title}</span>
                      <span className="font-mono text-[10px] text-fog">
                        {d.pages}p
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="hidden border-l border-line p-4 lg:block">
                <p className="label-caps text-ice">Assistant</p>
                <div className="mt-3 flex items-start gap-2 text-xs text-mist">
                  <MessageSquare size={14} className="mt-0.5 text-ice" />
                  Recommended queries stay grounded in the demo set.
                </div>
                <ul className="mt-4 space-y-2">
                  {recommendedQueries.slice(0, 3).map((q) => (
                    <li key={q} className="rounded-lg bg-white/3 p-2 text-[11px] text-mist">
                      {q}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex justify-center">
          <Button to="/workspace">
            Enter the Workspace
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-fog">
          Or <Link to="/workspace" className="text-ice underline-offset-4 hover:underline">open the full prototype</Link>
        </p>
      </div>
    </section>
  )
}
