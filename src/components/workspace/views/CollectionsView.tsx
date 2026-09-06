import { useState } from 'react'
import { Field } from '@/components/ui/Field'
import { useWorkspace } from '@/workspace/WorkspaceContext'
import { documentById } from '@/data/documents'

export function CollectionsView() {
  const ws = useWorkspace()
  const [name, setName] = useState('')

  return (
    <div>
      <p className="label-caps">Collections</p>
      <h1 className="mt-2 text-3xl tracking-display">Boundaries, not folders.</h1>
      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          void ws.createCol(name.trim())
          setName('')
        }}
      >
        <Field
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name"
        />
        <button type="submit" className="rounded-full bg-snow px-4 text-xs text-void">
          Create
        </button>
      </form>
      <p className="mt-2 text-[11px] text-fog">Local to this session.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ws.collections.map((c) => (
          <article key={c.id} className="rounded-2xl border border-line p-5">
            <p className="label-caps">{c.documentIds.length} files</p>
            <h2 className="mt-2 text-lg">{c.name}</h2>
            <p className="mt-2 text-sm text-mist">{c.description}</p>
            <ul className="mt-4 space-y-1 text-sm text-mist">
              {c.documentIds.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="hover:text-snow"
                    onClick={() => {
                      ws.setFilters({ collectionId: c.id })
                      ws.setView('search')
                    }}
                  >
                    {documentById[id]?.title ?? id}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 text-[11px] text-ice"
              onClick={() => {
                ws.setFilters({ collectionId: c.id })
                ws.setSearchQuery(c.name)
                void ws.runSearch(c.name)
              }}
            >
              Filter search by {c.name}
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
