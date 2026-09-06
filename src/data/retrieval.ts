import type { RetrievalStage, RetrievalTrace } from '@/types'

export const ragPhases: RetrievalStage[] = [
  {
    id: 'understand',
    label: 'Understanding query',
    detail: 'Parse intent, entities, and collection scope',
  },
  {
    id: 'search',
    label: 'Searching document index',
    detail: 'Dense retrieval over the local demo index',
  },
  {
    id: 'retrieve',
    label: 'Retrieving candidates',
    detail: 'Nearest-neighbor passages by meaning',
  },
  {
    id: 'rerank',
    label: 'Reranking evidence',
    detail: 'Cross-encoder style reordering (simulated)',
  },
  {
    id: 'context',
    label: 'Constructing context',
    detail: 'Pack retained passages into a grounded window',
  },
  {
    id: 'generate',
    label: 'Generating grounded answer',
    detail: 'Answer constrained to retrieved evidence',
  },
  {
    id: 'cite',
    label: 'Attaching citations',
    detail: 'Bind claims to page, section, and passage',
  },
]

export function demoTrace(
  chunks = 48,
  candidates = 12,
  retained = 5,
  documentsUsed = 3,
): RetrievalTrace {
  return {
    chunksSearched: chunks,
    candidates,
    retained,
    documentsUsed,
    demo: true,
  }
}

export const searchModeCopy: Record<string, string> = {
  semantic: 'Meaning first. Related ideas match even without shared keywords.',
  keyword: 'Exact tokens. Useful when you already know the phrase.',
  hybrid: 'Blend of meaning and tokens. Default for mixed corpora.',
}
