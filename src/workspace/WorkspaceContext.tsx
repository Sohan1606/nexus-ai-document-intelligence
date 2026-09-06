import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  askQuestion,
  createCollection,
  getCollections,
  getDocument,
  getSearchHistory,
  listDocuments,
  listSavedAnswers,
  recordSearch,
  saveAnswer,
  searchDocuments,
} from '@/services/api'
import { documentById } from '@/data/documents'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type {
  AskResult,
  ChatTurn,
  Collection,
  DocumentRecord,
  Evidence,
  SavedAnswer,
  SearchFilters,
  SearchHit,
  SearchHistoryItem,
  SearchMode,
  WorkspaceView,
} from '@/types'

export interface WorkspaceApi {
  view: WorkspaceView
  setView: (v: WorkspaceView) => void
  docs: DocumentRecord[]
  selected: DocumentRecord | null
  setSelected: (d: DocumentRecord | null) => void
  viewerDoc: DocumentRecord | null
  viewerPage: number
  viewerHighlight?: string
  openViewer: (id: string, page?: number, highlight?: string) => void
  closeViewer: () => void
  setViewerPage: (n: number) => void
  evidence: Evidence | null
  evidenceList: Evidence[]
  setEvidence: (e: Evidence | null) => void
  nextEvidence: () => void
  prevEvidence: () => void
  turns: ChatTurn[]
  busy: boolean
  stageIndex: number
  stageLabel: string | null
  lastResult: AskResult | null
  ask: (q: string) => Promise<void>
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchMode: SearchMode
  setSearchMode: (m: SearchMode) => void
  filters: SearchFilters
  setFilters: (f: SearchFilters) => void
  searchHits: SearchHit[]
  searchState: 'idle' | 'searching' | 'results' | 'empty'
  runSearch: (q?: string) => Promise<void>
  saved: SavedAnswer[]
  saveCurrent: () => Promise<void>
  history: SearchHistoryItem[]
  collections: Collection[]
  createCol: (name: string) => Promise<void>
  uploadOpen: boolean
  setUploadOpen: (v: boolean) => void
  refreshDocs: () => Promise<void>
  compareTopic: string | null
  setCompareTopic: (t: string | null) => void
  graphNode: string
  setGraphNode: (id: string) => void
  sheet: boolean
}

const Ctx = createContext<WorkspaceApi | null>(null)

export function useWorkspace() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWorkspace outside provider')
  return v
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [params] = useSearchParams()
  const sheet = useMediaQuery('(max-width: 1023px)')
  const [view, setView] = useState<WorkspaceView>('home')
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [selected, setSelected] = useState<DocumentRecord | null>(null)
  const [viewerDoc, setViewerDoc] = useState<DocumentRecord | null>(null)
  const [viewerPage, setViewerPage] = useState(1)
  const [viewerHighlight, setViewerHighlight] = useState<string | undefined>()
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [busy, setBusy] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [stageLabel, setStageLabel] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<AskResult | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('semantic')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchHits, setSearchHits] = useState<SearchHit[]>([])
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'results' | 'empty'>('idle')
  const [saved, setSaved] = useState<SavedAnswer[]>([])
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [compareTopic, setCompareTopic] = useState<string | null>(null)
  const [graphNode, setGraphNode] = useState('infra')
  const boot = useRef(false)

  useEffect(() => {
    void listDocuments().then((d) => {
      setDocs(d)
      setSelected(d[0] ?? null)
    })
    void listSavedAnswers().then(setSaved)
    void getSearchHistory().then(setHistory)
    void getCollections().then(setCollections)
  }, [])

  const openViewer = useCallback(
    (id: string, page = 1, highlight?: string) => {
      const apply = (d: DocumentRecord) => {
        setViewerDoc(d)
        setViewerPage(page)
        setViewerHighlight(highlight)
        setSelected(d)
        setView('viewer')
      }
      const d = docs.find((x) => x.id === id) ?? documentById[id]
      if (d) {
        apply(d)
        return
      }
      void getDocument(id).then((found) => {
        if (!found) return
        setDocs((prev) => (prev.some((x) => x.id === found.id) ? prev : [found, ...prev]))
        apply(found)
      })
    },
    [docs],
  )

  const refreshDocs = useCallback(async () => {
    const d = await listDocuments()
    setDocs(d)
  }, [])

  const closeViewer = useCallback(() => {
    setViewerDoc(null)
    setView('documents')
  }, [])

  const ask = useCallback(async (text: string) => {
    if (!text.trim()) return
    setView('assistant')
    setBusy(true)
    setStageIndex(0)
    setStageLabel('Understanding query')
    const user: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    }
    setTurns((t) => [...t, user])
    const result = await askQuestion(text, (i, _tot, label) => {
      setStageIndex(i)
      setStageLabel(label)
    })
    const assistant: ChatTurn = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: result.answer,
      bullets: result.bullets,
      citations: result.citations,
      stages: result.stages,
      claims: result.claims,
      trace: result.trace,
      resultId: result.id,
    }
    setTurns((t) => [...t, assistant])
    setLastResult(result)
    setEvidenceList(result.citations)
    setStageLabel(null)
    setBusy(false)
    void getSearchHistory().then(setHistory)
    if (result.comparison) setView('assistant')
  }, [])

  const runSearch = useCallback(
    async (q?: string) => {
      const query = (q ?? searchQuery).trim()
      if (!query) {
        setSearchHits([])
        setSearchState('idle')
        return
      }
      setSearchQuery(query)
      setView('search')
      setSearchState('searching')
      const hits = await searchDocuments(query, searchMode, filters)
      await recordSearch(query)
      setSearchHits(hits)
      setSearchState(hits.length ? 'results' : 'empty')
      void getSearchHistory().then(setHistory)
    },
    [searchQuery, searchMode, filters],
  )

  const saveCurrent = useCallback(async () => {
    if (!lastResult) return
    const item = await saveAnswer(lastResult)
    setSaved((s) => [item, ...s])
  }, [lastResult])

  const createCol = useCallback(async (name: string) => {
    const col = await createCollection(name)
    setCollections((c) => [...c, col])
  }, [])

  const nextEvidence = useCallback(() => {
    if (!evidence) return
    const i = evidenceList.findIndex((e) => e.id === evidence.id)
    if (i >= 0 && i < evidenceList.length - 1) setEvidence(evidenceList[i + 1])
  }, [evidence, evidenceList])

  const prevEvidence = useCallback(() => {
    if (!evidence) return
    const i = evidenceList.findIndex((e) => e.id === evidence.id)
    if (i > 0) setEvidence(evidenceList[i - 1])
  }, [evidence, evidenceList])

  useEffect(() => {
    const v = params.get('view') as WorkspaceView | null
    const q = params.get('q')
    const doc = params.get('doc')
    const page = Number(params.get('page') ?? '1')
    const upload = params.get('upload')
    if (v) setView(v)
    if (doc) openViewer(doc, page)
    if (upload === '1') setUploadOpen(true)
    if (q && !boot.current) {
      boot.current = true
      void ask(q)
    }
  }, [params, ask, openViewer])

  const api = useMemo<WorkspaceApi>(
    () => ({
      view,
      setView,
      docs,
      selected,
      setSelected,
      viewerDoc,
      viewerPage,
      viewerHighlight,
      openViewer,
      closeViewer,
      setViewerPage,
      evidence,
      evidenceList,
      setEvidence,
      nextEvidence,
      prevEvidence,
      turns,
      busy,
      stageIndex,
      stageLabel,
      lastResult,
      ask,
      searchQuery,
      setSearchQuery,
      searchMode,
      setSearchMode,
      filters,
      setFilters,
      searchHits,
      searchState,
      runSearch,
      saved,
      saveCurrent,
      history,
      collections,
      createCol,
      uploadOpen,
      setUploadOpen,
      refreshDocs,
      compareTopic,
      setCompareTopic,
      graphNode,
      setGraphNode,
      sheet,
    }),
    [
      view,
      docs,
      selected,
      viewerDoc,
      viewerPage,
      viewerHighlight,
      openViewer,
      closeViewer,
      evidence,
      evidenceList,
      nextEvidence,
      prevEvidence,
      turns,
      busy,
      stageIndex,
      stageLabel,
      lastResult,
      ask,
      searchQuery,
      searchMode,
      filters,
      searchHits,
      searchState,
      runSearch,
      saved,
      saveCurrent,
      history,
      collections,
      createCol,
      uploadOpen,
      refreshDocs,
      compareTopic,
      graphNode,
      sheet,
    ],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
