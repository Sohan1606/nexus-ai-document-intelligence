export type DocumentType = 'pdf' | 'md' | 'txt' | 'docx'

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'

export type DocumentStatus = 'ready' | 'indexing' | 'processing' | 'attention'

export type SearchMode = 'semantic' | 'keyword' | 'hybrid'

export type WorkspaceView =
  | 'home'
  | 'search'
  | 'documents'
  | 'collections'
  | 'saved'
  | 'history'
  | 'settings'
  | 'assistant'
  | 'compare'
  | 'graph'
  | 'viewer'

export interface Passage {
  id: string
  page: number
  section: string
  text: string
}

export interface DocumentRecord {
  id: string
  title: string
  type: DocumentType
  date: string
  created: string
  modified: string
  year: number
  pages: number
  chunks: number
  sizeBytes: number
  topics: string[]
  collection: string
  collectionId: string
  summary: string
  status: DocumentStatus
  health: number
  sections: string[]
  passages: Passage[]
}

export interface Chunk {
  id: string
  documentId: string
  page: number
  section: string
  text: string
  index: number
}

export interface Collection {
  id: string
  name: string
  description: string
  documentIds: string[]
}

export interface SearchHit {
  documentId: string
  title: string
  page: number
  section: string
  relevance: number
  concept: string
  snippet: string
  type: DocumentType
  collection: string
  mode: SearchMode
  chunkId?: string
}

export interface SearchFilters {
  collectionId?: string
  type?: DocumentType | 'all'
  year?: number | 'all'
}

export interface Evidence {
  id: string
  documentId: string
  documentTitle: string
  page: number
  section: string
  passage: string
  highlight: string
  similarity: number
  confidence: Confidence
  prevPassage?: string
  nextPassage?: string
}

export interface Citation extends Evidence {
  index: number
}

export interface RetrievalStage {
  id: string
  label: string
  detail: string
}

export interface RetrievalTrace {
  chunksSearched: number
  candidates: number
  retained: number
  documentsUsed: number
  demo: boolean
  reranked?: boolean
  llm?: 'ollama' | 'extractive' | 'none'
}

export interface Claim {
  id: string
  text: string
  supported: boolean
  evidenceIds: string[]
}

export interface AskResult {
  id: string
  question: string
  answer: string
  bullets?: string[]
  citations: Evidence[]
  stages: RetrievalStage[]
  claims?: Claim[]
  relatedDocumentIds?: string[]
  trace: RetrievalTrace
  comparison?: boolean
  demo: boolean
  llmAvailable?: boolean
}

export interface SavedAnswer {
  id: string
  question: string
  answer: string
  citations: Evidence[]
  relatedDocumentIds: string[]
  savedAt: string
}

export interface SearchHistoryItem {
  id: string
  query: string
  at: string
  kind: 'search' | 'ask'
}

export interface ChatTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  bullets?: string[]
  citations?: Evidence[]
  stages?: RetrievalStage[]
  claims?: Claim[]
  trace?: RetrievalTrace
  resultId?: string
}

export interface PromptScript {
  prompt: string
  result: Omit<AskResult, 'id' | 'question'>
}

export interface UploadStage {
  id: string
  label: string
}

export interface UploadResult {
  ok: true
  name: string
  type: string
  sizeBytes: number
  estimatedPages: number
  chunks: number
  sections: number
  demo: boolean
  documentId?: string
}

export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  documents: string[]
  topics?: string[]
}

export interface GraphEdge {
  from: string
  to: string
}

export interface TimelineEvent {
  id: string
  year: number
  quarter?: string
  documentId: string
}

export interface PolicyChange {
  kind: 'added' | 'removed' | 'changed' | 'unchanged'
  topic: string
  from?: string
  to?: string
  sourceA?: Evidence
  sourceB?: Evidence
}

export interface Conversation {
  id: string
  turns: ChatTurn[]
  updatedAt: string
}
