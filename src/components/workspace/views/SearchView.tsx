import { Field } from '@/components/ui/Field'
import { searchModeCopy } from '@/data/retrieval'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { cn } from '@/utils/cn'
import type { SearchMode } from '@/types'

const modes: SearchMode[] = ['semantic', 'keyword', 'hybrid']

export function SearchView() {
  const ws = useWorkspace()

  return (
    <div>
      <p className="label-caps">Search</p>
      <h1 className="mt-2 text-3xl tracking-display">Ask for the idea.</h1>

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault()
          void ws.runSearch()
        }}
      >
        <Field
          value={ws.searchQuery}
          onChange={(e) => ws.setSearchQuery(e.target.value)}
          placeholder="Where did infrastructure costs increase?"
          aria-label="Search query"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => ws.setSearchMode(m)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11px] tracking-widest uppercase',
                ws.searchMode === m
                  ? 'border-ice/40 bg-ice/10 text-ice'
                  : 'border-line text-fog',
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-fog">{searchModeCopy[ws.searchMode]}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="rounded-full border border-line bg-ink px-3 py-1.5 text-xs text-mist"
            value={ws.filters.collectionId ?? 'all'}
            onChange={(e) =>
              ws.setFilters({
                ...ws.filters,
                collectionId: e.target.value === 'all' ? undefined : e.target.value,
              })
            }
          >
            <option value="all">All collections</option>
            {ws.collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-full border border-line bg-ink px-3 py-1.5 text-xs text-mist"
            value={ws.filters.type ?? 'all'}
            onChange={(e) =>
              ws.setFilters({
                ...ws.filters,
                type: e.target.value === 'all' ? 'all' : (e.target.value as never),
              })
            }
          >
            <option value="all">All types</option>
            <option value="pdf">PDF</option>
            <option value="md">MD</option>
            <option value="docx">DOCX</option>
          </select>
          <select
            className="rounded-full border border-line bg-ink px-3 py-1.5 text-xs text-mist"
            value={String(ws.filters.year ?? 'all')}
            onChange={(e) =>
              ws.setFilters({
                ...ws.filters,
                year: e.target.value === 'all' ? 'all' : Number(e.target.value),
              })
            }
          >
            <option value="all">All years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-snow px-4 py-1.5 text-xs text-void"
          >
            Search
          </button>
        </div>
      </form>

      {ws.searchState === 'searching' && (
        <p className="mt-10 font-mono text-xs tracking-widest text-ice">
          QUERY → RETRIEVAL → RANKING · demo
        </p>
      )}
      {ws.searchState === 'empty' && (
        <p className="mt-10 text-sm text-fog">No results in the demo corpus.</p>
      )}
      {ws.searchState === 'idle' && (
        <p className="mt-10 text-sm text-fog">
          Try “Where did infrastructure costs increase?”
        </p>
      )}

      {ws.searchState === 'results' && (
        <ul className="mt-10 space-y-3">
          {ws.searchHits.map((h) => (
            <li key={`${h.documentId}-${h.page}`}>
              <button
                type="button"
                onClick={() => ws.openViewer(h.documentId, h.page, h.snippet)}
                className="w-full rounded-2xl border border-line p-4 text-left hover:border-ice/30"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-snow">{h.title}</p>
                  <p className="font-mono text-[11px] text-ice">
                    {(h.relevance * 100).toFixed(0)}%
                  </p>
                </div>
                <p className="mt-1 font-mono text-[10px] tracking-widest text-fog uppercase">
                  p.{h.page} · {h.section} · {h.concept} · {h.mode}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-mist">{h.snippet}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
