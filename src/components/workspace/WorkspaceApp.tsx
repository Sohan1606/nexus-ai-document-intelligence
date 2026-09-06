import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  Folder,
  History,
  LayoutGrid,
  Search,
  Settings,
  Upload,
  FileText,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { DEMO_MODE } from '@/services/api'
import { Kbd } from '@/components/ui/Kbd'
import { EvidenceInspector } from '@/components/ui/EvidenceInspector'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { cn } from '@/utils/cn'
import type { WorkspaceView } from '@/types'
import { HomeView } from './views/HomeView'
import { SearchView } from './views/SearchView'
import { DocumentsView } from './views/DocumentsView'
import { AssistantView } from './views/AssistantView'
import { CollectionsView } from './views/CollectionsView'
import { SavedView } from './views/SavedView'
import { HistoryView } from './views/HistoryView'
import { SettingsView } from './views/SettingsView'
import { CompareView } from './views/CompareView'
import { GraphView } from './views/GraphView'
import { ContextPanel } from './ContextPanel'
import { UploadDialog } from './UploadDialog'
import { DocumentViewer } from './DocumentViewer'

const nav: { id: WorkspaceView; label: string; icon: typeof Search }[] = [
  { id: 'home', label: 'Workspace', icon: LayoutGrid },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'collections', label: 'Collections', icon: Folder },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function WorkspaceApp() {
  const ws = useWorkspace()
  const { setOpen: setPalette } = useCommandPalette()
  const [more, setMore] = useState(false)

  return (
    <div className="flex h-[100dvh] flex-col bg-void text-snow">
      <header className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden text-[11px] tracking-[0.2em] text-fog sm:inline">
            WORKSPACE
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-line bg-ink px-4 py-2 text-sm text-fog md:flex"
          data-cursor="hover"
        >
          <Search size={14} className="text-ice" />
          Ask the corpus
          <span className="ml-auto">
            <Kbd>⌘K</Kbd>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <DemoBadge label={DEMO_MODE ? 'Prototype mode' : 'Local RAG'} />
          <button
            type="button"
            onClick={() => ws.setUploadOpen(true)}
            className="hidden rounded-full border border-line px-3 py-1.5 text-[11px] text-mist hover:text-snow sm:inline-flex"
          >
            <Upload size={12} className="mr-1" /> Ingest
          </button>
          <Link
            to="/"
            className="rounded-full border border-line px-3 py-1.5 text-[11px] text-mist hover:text-snow"
            data-cursor="hover"
          >
            Film
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 flex-col border-r border-line bg-ink p-3 md:flex">
          <button
            type="button"
            onClick={() => ws.setView('assistant')}
            className="mb-3 rounded-full bg-snow px-3 py-2 text-xs font-medium text-void"
            data-cursor="hover"
          >
            Ask NEXUS
          </button>
          <ul className="space-y-0.5">
            {nav.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => ws.setView(n.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    ws.view === n.id ? 'bg-white/6 text-snow' : 'text-mist hover:text-snow',
                  )}
                >
                  <n.icon size={15} />
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-1 px-1 pt-6">
            <button
              type="button"
              onClick={() => ws.setView('compare')}
              className={cn(
                'block w-full rounded-lg px-2 py-1.5 text-left text-[12px]',
                ws.view === 'compare' ? 'text-ice' : 'text-fog hover:text-mist',
              )}
            >
              Compare policies
            </button>
            <button
              type="button"
              onClick={() => ws.setView('graph')}
              className={cn(
                'block w-full rounded-lg px-2 py-1.5 text-left text-[12px]',
                ws.view === 'graph' ? 'text-ice' : 'text-fog hover:text-mist',
              )}
            >
              Knowledge graph
            </button>
            <p className="pt-4 text-[10px] leading-relaxed text-fog">
              {DEMO_MODE
                ? 'Demo retrieval. Switch VITE_API_MODE=local for FastAPI.'
                : 'Local RAG via FastAPI. Falls back to demo if the API is down.'}
            </p>
          </div>
        </aside>

        <main className="custom-scroll min-w-0 flex-1 overflow-y-auto">
          {ws.view === 'viewer' && ws.viewerDoc ? (
            <DocumentViewer
              doc={ws.viewerDoc}
              page={ws.viewerPage}
              highlight={ws.viewerHighlight}
              onPage={ws.setViewerPage}
              onClose={ws.closeViewer}
            />
          ) : (
            <div className="p-4 sm:p-6">
              {ws.view === 'home' && <HomeView />}
              {ws.view === 'search' && <SearchView />}
              {ws.view === 'documents' && <DocumentsView />}
              {ws.view === 'assistant' && <AssistantView />}
              {ws.view === 'collections' && <CollectionsView />}
              {ws.view === 'saved' && <SavedView />}
              {ws.view === 'history' && <HistoryView />}
              {ws.view === 'settings' && <SettingsView />}
              {ws.view === 'compare' && <CompareView />}
              {ws.view === 'graph' && <GraphView />}
            </div>
          )}
        </main>

        {ws.view !== 'viewer' && (
          <aside className="custom-scroll hidden w-[300px] shrink-0 overflow-y-auto border-l border-line bg-ink xl:block">
            <ContextPanel />
          </aside>
        )}
      </div>

      <nav className="flex border-t border-line md:hidden">
        {nav.slice(0, 4).map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => ws.setView(n.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-[10px]',
              ws.view === n.id ? 'text-ice' : 'text-fog',
            )}
          >
            <n.icon size={16} />
            {n.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] text-fog"
        >
          More
        </button>
      </nav>

      {more && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-line bg-ink p-3 md:hidden">
          {nav.slice(4).map((n) => (
            <button
              key={n.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mist"
              onClick={() => {
                ws.setView(n.id)
                setMore(false)
              }}
            >
              <n.icon size={15} /> {n.label}
            </button>
          ))}
          <button
            type="button"
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-mist"
            onClick={() => {
              ws.setView('assistant')
              setMore(false)
            }}
          >
            Ask NEXUS
          </button>
        </div>
      )}

      <UploadDialog />
      <EvidenceInspector
        evidence={ws.evidence}
        list={ws.evidenceList}
        onClose={() => ws.setEvidence(null)}
        onPrev={ws.prevEvidence}
        onNext={ws.nextEvidence}
        onOpenDocument={(id, page) => {
          const ev = ws.evidence
          ws.setEvidence(null)
          ws.openViewer(id, page, ev?.highlight)
        }}
        variant={ws.sheet ? 'sheet' : 'panel'}
      />
    </div>
  )
}
