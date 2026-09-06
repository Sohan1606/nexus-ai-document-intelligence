import Fuse from 'fuse.js'
import { documents, documentById } from '@/data/documents'
import { collections } from '@/data/collections'
import { matchPrompt, allEvidence } from '@/data/chat'
import { ragPhases } from '@/data/retrieval'
import { readJson, writeJson } from '@/utils/storage'
import type {
  AskResult,
  Collection,
  DocumentRecord,
  DocumentType,
  Evidence,
  SavedAnswer,
  SearchFilters,
  SearchHit,
  SearchHistoryItem,
  SearchMode,
  UploadResult,
  UploadStage,
} from '@/types'

/**
 * API abstraction for NEXUS.
 *
 * VITE_API_MODE=demo (default) — cinematic local simulation, no backend required.
 * VITE_API_MODE=local — FastAPI RAG at VITE_API_BASE_URL (or same-origin / vite proxy).
 * If local mode is set but FastAPI is down, calls fall back to the demo corpus
 * so the frontend stays usable.
 */

export const API_MODE: 'demo' | 'local' =
  import.meta.env.VITE_API_MODE === 'local' ? 'local' : 'demo'

export const DEMO_MODE = API_MODE !== 'local'

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

let localReady: boolean | null = null

export type HealthInfo = {
  ok: boolean
  documents: number
  chunks: number
  embedding: string
  rerank: string
  llm: { provider: string; available: boolean; model: string; fallback: string }
}

export async function getHealth(): Promise<HealthInfo | null> {
  try {
    const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(1500) })
    if (!r.ok) return null
    return (await r.json()) as HealthInfo
  } catch {
    return null
  }
}

async function localApiReady(): Promise<boolean> {
  if (API_MODE !== 'local') return false
  if (localReady === true) return true
  const h = await getHealth()
  localReady = Boolean(h?.ok)
  return localReady
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const r = await fetch(`${BASE}${path}`, { ...init, headers })
  if (!r.ok) {
    let message = r.statusText
    try {
      const body = (await r.json()) as { detail?: unknown; error?: string }
      if (typeof body.error === 'string') message = body.error
      else if (typeof body.detail === 'string') message = body.detail
    } catch {
      /* keep statusText */
    }
    throw new Error(message || `Request failed (${r.status})`)
  }
  return r.json() as Promise<T>
}

const fuse = new Fuse(documents, {
  includeScore: true,
  threshold: 0.38,
  keys: [
    { name: 'title', weight: 0.35 },
    { name: 'topics', weight: 0.2 },
    { name: 'summary', weight: 0.15 },
    { name: 'passages.text', weight: 0.25 },
    { name: 'passages.section', weight: 0.05 },
  ],
})

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function applyFilters(docs: DocumentRecord[], filters?: SearchFilters) {
  return docs.filter((d) => {
    if (filters?.collectionId && d.collectionId !== filters.collectionId) return false
    if (filters?.type && filters.type !== 'all' && d.type !== filters.type) return false
    if (filters?.year && filters.year !== 'all' && d.year !== filters.year) return false
    return true
  })
}

export async function searchDocuments(
  query: string,
  mode: SearchMode = 'semantic',
  filters?: SearchFilters,
): Promise<SearchHit[]> {
  if (await localApiReady()) {
    try {
      return await api<SearchHit[]>('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          mode,
          collectionId: filters?.collectionId,
          type: filters?.type && filters.type !== 'all' ? filters.type : undefined,
          year: typeof filters?.year === 'number' ? filters.year : undefined,
        }),
      })
    } catch {
      localReady = false
    }
  }
  return demoSearch(query, mode, filters)
}

async function demoSearch(query: string, mode: SearchMode, filters?: SearchFilters): Promise<SearchHit[]> {
  await wait(DEMO_MODE ? 220 : 80)
  const q = query.trim()
  if (!q) return []

  const pool = applyFilters(documents, filters)
  const qLower = q.toLowerCase()
  const tokens = qLower.split(/\s+/).filter((t) => t.length > 2)

  if (mode === 'keyword') {
    return pool
      .flatMap((item) => {
        const passage =
          item.passages.find((p) => tokens.some((t) => p.text.toLowerCase().includes(t))) ??
          item.passages[0]
        const hay = (item.title + ' ' + (passage?.text ?? '')).toLowerCase()
        const hits = tokens.filter((t) => hay.includes(t)).length
        if (!hits) return []
        return [
          {
            documentId: item.id,
            title: item.title,
            page: passage?.page ?? 1,
            section: passage?.section ?? '—',
            relevance: Math.min(0.99, 0.45 + hits * 0.12),
            concept: item.topics[0] ?? 'keyword',
            snippet: passage?.text.slice(0, 160) ?? item.summary,
            type: item.type,
            collection: item.collection,
            mode,
          } satisfies SearchHit,
        ]
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8)
  }

  const hits = fuse.search(q).filter((h) => pool.some((d) => d.id === h.item.id))
  return hits.slice(0, 8).map(({ item, score }) => {
    const passage =
      item.passages.find((p) => tokens.some((t) => p.text.toLowerCase().includes(t))) ?? item.passages[0]
    const semantic = Math.max(0.42, 1 - (score ?? 0.3))
    const keywordBoost = passage
      ? tokens.filter((t) => passage.text.toLowerCase().includes(t)).length * 0.03
      : 0
    const relevance =
      mode === 'hybrid' ? Math.min(0.99, semantic * 0.7 + keywordBoost + 0.15) : semantic
    return {
      documentId: item.id,
      title: item.title,
      page: passage?.page ?? 1,
      section: passage?.section ?? '—',
      relevance,
      concept: item.topics[0] ?? 'related',
      snippet: passage?.text.slice(0, 160) ?? item.summary,
      type: item.type,
      collection: item.collection,
      mode,
    }
  })
}

export async function askQuestion(
  query: string,
  onStage?: (index: number, total: number, label: string, detail: string) => void,
): Promise<AskResult> {
  if (await localApiReady()) {
    try {
      const stages = ragPhases
      for (let i = 0; i < stages.length; i++) {
        onStage?.(i, stages.length, stages[i].label, stages[i].detail)
        await wait(90)
      }
      const result = await api<AskResult>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ query, mode: 'hybrid' }),
      })
      pushHistory({ id: `h-${result.id}`, query, at: new Date().toISOString(), kind: 'ask' })
      return { ...result, demo: false }
    } catch {
      localReady = false
    }
  }
  return demoAsk(query, onStage)
}

async function demoAsk(
  query: string,
  onStage?: (index: number, total: number, label: string, detail: string) => void,
): Promise<AskResult> {
  const script = matchPrompt(query)
  const stages = script.result.stages.length ? script.result.stages : ragPhases
  for (let i = 0; i < stages.length; i++) {
    onStage?.(i, stages.length, stages[i].label, stages[i].detail)
    await wait(380 + i * 70)
  }
  await wait(200)
  const id = `ask-${Date.now()}`
  const result: AskResult = {
    ...script.result,
    id,
    question: query,
    demo: true,
    stages,
  }
  pushHistory({ id: `h-${id}`, query, at: new Date().toISOString(), kind: 'ask' })
  return result
}

export async function getDocument(id: string): Promise<DocumentRecord | null> {
  if (await localApiReady()) {
    try {
      return await api<DocumentRecord>(`/api/documents/${encodeURIComponent(id)}`)
    } catch {
      /* fall through */
    }
  }
  await wait(70)
  return documentById[id] ?? null
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  if (await localApiReady()) {
    try {
      return await api<DocumentRecord[]>('/api/documents')
    } catch {
      localReady = false
    }
  }
  await wait(50)
  return documents
}

export async function getEvidence(id: string): Promise<Evidence | null> {
  if (await localApiReady()) {
    try {
      return await api<Evidence>(`/api/evidence/${encodeURIComponent(id)}`)
    } catch {
      /* fall through */
    }
  }
  await wait(60)
  return allEvidence.find((e) => e.id === id) ?? null
}

export async function getCollections(): Promise<Collection[]> {
  if (await localApiReady()) {
    try {
      return await api<Collection[]>('/api/collections')
    } catch {
      localReady = false
    }
  }
  await wait(40)
  const extra = readJson<Collection[]>('nexus.collections', [])
  return [...collections, ...extra]
}

export async function createCollection(name: string): Promise<Collection> {
  if (await localApiReady()) {
    try {
      return await api<Collection>('/api/collections', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
    } catch {
      localReady = false
    }
  }
  await wait(80)
  const col: Collection = {
    id: `col-${Date.now()}`,
    name,
    description: 'Local collection (session)',
    documentIds: [],
  }
  const extra = readJson<Collection[]>('nexus.collections', [])
  writeJson('nexus.collections', [...extra, col])
  return col
}

export async function saveAnswer(result: AskResult): Promise<SavedAnswer> {
  const item: SavedAnswer = {
    id: `saved-${Date.now()}`,
    question: result.question,
    answer: result.answer,
    citations: result.citations,
    relatedDocumentIds: result.relatedDocumentIds ?? [],
    savedAt: new Date().toISOString(),
  }
  if (await localApiReady()) {
    try {
      return await api<SavedAnswer>('/api/saved', { method: 'POST', body: JSON.stringify(item) })
    } catch {
      localReady = false
    }
  }
  await wait(60)
  const all = readJson<SavedAnswer[]>('nexus.saved', [])
  writeJson('nexus.saved', [item, ...all].slice(0, 24))
  return item
}

export async function listSavedAnswers(): Promise<SavedAnswer[]> {
  if (await localApiReady()) {
    try {
      return await api<SavedAnswer[]>('/api/saved')
    } catch {
      localReady = false
    }
  }
  await wait(40)
  return readJson<SavedAnswer[]>('nexus.saved', [])
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  if (await localApiReady()) {
    try {
      const rows = await api<{ query: string; at: string }[]>('/api/history')
      return rows.map((h, i) => ({
        id: `h-${i}-${h.at}`,
        query: h.query,
        at: h.at,
        kind: 'search' as const,
      }))
    } catch {
      localReady = false
    }
  }
  await wait(30)
  return readJson<SearchHistoryItem[]>('nexus.history', [])
}

function pushHistory(item: SearchHistoryItem) {
  const all = readJson<SearchHistoryItem[]>('nexus.history', [])
  const next = [item, ...all.filter((h) => h.query !== item.query)].slice(0, 20)
  writeJson('nexus.history', next)
}

export async function recordSearch(query: string) {
  if (await localApiReady()) {
    try {
      await api('/api/history', { method: 'POST', body: JSON.stringify({ query }) })
    } catch {
      /* still record locally */
    }
  }
  pushHistory({
    id: `h-${Date.now()}`,
    query,
    at: new Date().toISOString(),
    kind: 'search',
  })
}

export const uploadStages: UploadStage[] = [
  { id: 'select', label: 'Reading' },
  { id: 'parse', label: 'Parsing' },
  { id: 'chunk', label: 'Chunking' },
  { id: 'embed', label: 'Embedding' },
  { id: 'index', label: 'Indexing' },
  { id: 'ready', label: 'Ready' },
]

export async function uploadDocument(
  file: File,
  onStage?: (stage: UploadStage, index: number) => void,
): Promise<UploadResult> {
  if (await localApiReady()) {
    try {
      for (let i = 0; i < uploadStages.length - 1; i++) {
        onStage?.(uploadStages[i], i)
        await wait(120)
      }
      const form = new FormData()
      form.append('file', file, file.name)
      const res = await api<UploadResult & { documentId?: string }>('/api/upload', {
        method: 'POST',
        body: form,
      })
      onStage?.(uploadStages[uploadStages.length - 1], uploadStages.length - 1)
      return { ...res, demo: false }
    } catch (err) {
      localReady = false
      throw err
    }
  }
  for (let i = 0; i < uploadStages.length; i++) {
    onStage?.(uploadStages[i], i)
    await wait(480 + i * 80)
  }
  const estimatedPages = Math.max(1, Math.round(file.size / 24000) || 4)
  return {
    ok: true,
    name: file.name,
    type: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    estimatedPages,
    chunks: estimatedPages * 4,
    sections: Math.max(2, Math.round(estimatedPages / 3)),
    demo: true,
  }
}

export type { DocumentType }
