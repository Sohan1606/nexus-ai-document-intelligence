import type { GraphEdge, GraphNode, PolicyChange, TimelineEvent } from '@/types'

export const pipelineStages = [
  {
    id: 'document',
    label: 'DOCUMENT',
    title: 'Ingest',
    copy: 'Accept PDFs, notes, and technical files into an isolated collection.',
    meta: 'PDF · DOCX · MD · TXT',
  },
  {
    id: 'parse',
    label: 'PARSE',
    title: 'Read structure',
    copy: 'Recover pages, headings, tables, and reading order — not just raw bytes.',
    meta: 'layout-aware',
  },
  {
    id: 'chunk',
    label: 'CHUNK',
    title: 'Split with care',
    copy: 'Break language into passages that keep meaning intact across boundaries.',
    meta: '~400–800 tokens',
  },
  {
    id: 'embed',
    label: 'EMBED',
    title: 'Vectorize meaning',
    copy: 'Convert language into vectors so related ideas can be found by meaning.',
    meta: 'local embedding model',
  },
  {
    id: 'retrieve',
    label: 'RETRIEVE',
    title: 'Search the space',
    copy: 'Search the vector space for the most relevant passages.',
    meta: 'FAISS by default',
  },
  {
    id: 'rerank',
    label: 'RERANK',
    title: 'Precision pass',
    copy: 'Reorder retrieved evidence for stronger contextual precision.',
    meta: 'cross-encoder optional',
  },
  {
    id: 'generate',
    label: 'GENERATE',
    title: 'Answer from evidence',
    copy: 'Produce an answer grounded in retrieved evidence.',
    meta: 'OpenAI-compatible or local LLM',
  },
  {
    id: 'cite',
    label: 'CITE',
    title: 'Leave a trail',
    copy: 'Trace every claim back to its source.',
    meta: 'page · section · passage',
  },
] as const

export const architectureLayers = [
  { id: 'react', label: 'React', detail: 'Cinematic product UI' },
  { id: 'api', label: 'FastAPI', detail: 'Typed retrieval API' },
  { id: 'lc', label: 'LangChain', detail: 'Composable RAG graph' },
  { id: 'embed', label: 'Embedding model', detail: 'Local or compatible' },
  { id: 'faiss', label: 'FAISS', detail: 'In-process vector index' },
  { id: 'retriever', label: 'Retriever', detail: 'Dense + metadata filters' },
  { id: 'reranker', label: 'Reranker', detail: 'Precision reordering' },
  { id: 'llm', label: 'LLM', detail: 'Open-source or compatible' },
  { id: 'cite', label: 'Citations', detail: 'Grounded claims' },
] as const

export const techBadges = [
  'React',
  'TypeScript',
  'FastAPI',
  'LangChain',
  'FAISS',
  'Python',
  'Docker',
  'Vite',
]

export const openStack = [
  { name: 'FAISS', role: 'Local vector search' },
  { name: 'Ollama', role: 'Local model runtime' },
  { name: 'Llama-family', role: 'Compatible open models' },
  { name: 'FastAPI', role: 'Retrieval service' },
  { name: 'LangChain', role: 'Orchestration' },
  { name: 'React', role: 'Product surface' },
  { name: 'Docker', role: 'Repeatable deploys' },
]

export const securityFeatures = [
  {
    title: 'Source traceability',
    copy: 'Every answer can be opened back to page, section, and passage.',
  },
  {
    title: 'Document isolation',
    copy: 'Collections are boundaries. Retrievers do not casually cross them.',
  },
  {
    title: 'Local-first architecture',
    copy: 'FAISS and local models are first-class — not an afterthought.',
  },
  {
    title: 'Controlled access',
    copy: 'Designed so identity can wrap collections, queries, and citations.',
  },
  {
    title: 'Evidence inspection',
    copy: 'Humans can see what the model saw before they trust it.',
  },
  {
    title: 'Retrieval transparency',
    copy: 'Search, rerank, and generate are visible stages — not a black box.',
  },
]

export const engineeringPrinciples = [
  {
    kicker: 'FAST RETRIEVAL',
    title: 'Meaning, then milliseconds',
    copy: 'Vector search is local by default. The demo does not invent production latency numbers.',
  },
  {
    kicker: 'MODULAR ARCHITECTURE',
    title: 'Replace the model, keep the trail',
    copy: 'Embeddings, indexes, and LLMs are swappable behind a stable API contract.',
  },
  {
    kicker: 'SOURCE-GROUNDED ANSWERS',
    title: 'No claim without a path',
    copy: 'Generation is downstream of retrieval. Citations are part of the answer, not decoration.',
  },
  {
    kicker: 'LOCAL-FIRST OPTION',
    title: 'Works without a bill',
    copy: 'This showcase runs entirely in the browser. A FastAPI backend can be attached later.',
  },
  {
    kicker: 'OPEN-SOURCE FRIENDLY',
    title: 'No mandatory vendor',
    copy: 'Designed to run without locking the product to a paid AI provider.',
  },
]

export const features = [
  {
    title: 'Semantic Search',
    copy: 'Ask for the idea. Retrieve the passages that mean it.',
    span: 'lg:col-span-2',
    visual: 'search',
  },
  {
    title: 'Multi-Document Q&A',
    copy: 'One question across a collection — not a single PDF.',
    span: '',
    visual: 'multi',
  },
  {
    title: 'Citation Tracking',
    copy: 'Inline markers that open the exact source.',
    span: '',
    visual: 'cite',
  },
  {
    title: 'Evidence Inspector',
    copy: 'Page, section, similarity, confidence.',
    span: 'lg:col-span-2',
    visual: 'evidence',
  },
  {
    title: 'Document Collections',
    copy: 'Keep research, legal, and ops knowledge apart.',
    span: '',
    visual: 'collections',
  },
  {
    title: 'Conversation Memory',
    copy: 'Follow-ups stay inside the same evidence trail.',
    span: '',
    visual: 'memory',
  },
  {
    title: 'Search History',
    copy: 'Replay a question and the documents it touched.',
    span: '',
    visual: 'history',
  },
  {
    title: 'Knowledge Graph',
    copy: 'See how concepts co-occur across the corpus.',
    span: '',
    visual: 'graph',
  },
  {
    title: 'Document Comparison',
    copy: 'Added, removed, changed — with sources.',
    span: 'lg:col-span-2',
    visual: 'compare',
  },
  {
    title: 'Local AI Architecture',
    copy: 'FAISS, local models, Docker — no required bill.',
    span: '',
    visual: 'local',
  },
  {
    title: 'Command Search',
    copy: '⌘K. Ask the workspace as you would a colleague.',
    span: '',
    visual: 'cmdk',
  },
  {
    title: 'Responsive Workspace',
    copy: 'The product, not a shrunk dashboard, on every screen.',
    span: '',
    visual: 'responsive',
  },
] as const

export const graphNodes: GraphNode[] = [
  { id: 'infra', label: 'Infrastructure', x: 18, y: 28, documents: ['q3-infra', 'migration', 'k8s-ops'], topics: ['Capacity', 'Platform'] },
  { id: 'k8s', label: 'Kubernetes', x: 42, y: 46, documents: ['k8s-ops', 'migration', 'reliability'], topics: ['HPA', 'NVMe'] },
  { id: 'scaling', label: 'Scaling', x: 38, y: 74, documents: ['reliability', 'k8s-ops', 'q3-infra'], topics: ['Rerank', 'HPA'] },
  { id: 'cost', label: 'Cost', x: 18, y: 82, documents: ['devops-cost', 'q3-infra', 'finops'], topics: ['GPU', 'Reserved'] },
  { id: 'cloud', label: 'Cloud', x: 50, y: 18, documents: ['q3-infra', 'cloud-sec', 'devops-cost'], topics: ['Regions', 'GPU'] },
  { id: 'security', label: 'Security', x: 78, y: 32, documents: ['cloud-sec', 'zero-trust', 'policy-2025'], topics: ['Hardening'] },
  { id: 'identity', label: 'Identity', x: 88, y: 54, documents: ['cloud-sec', 'policy-2025', 'zero-trust'], topics: ['SSO', 'IAP'] },
  { id: 'zt', label: 'Zero Trust', x: 72, y: 16, documents: ['zero-trust', 'policy-2025'], topics: ['Collections'] },
  { id: 'compliance', label: 'Compliance', x: 82, y: 78, documents: ['soc2-notes', 'policy-2025', 'incident'], topics: ['Evidence logs'] },
]

export const graphEdges: GraphEdge[] = [
  { from: 'infra', to: 'k8s' },
  { from: 'k8s', to: 'scaling' },
  { from: 'scaling', to: 'cost' },
  { from: 'cloud', to: 'infra' },
  { from: 'cloud', to: 'cost' },
  { from: 'cloud', to: 'security' },
  { from: 'security', to: 'identity' },
  { from: 'identity', to: 'zt' },
  { from: 'compliance', to: 'security' },
  { from: 'k8s', to: 'cloud' },
]

export const timelineEvents: TimelineEvent[] = [
  { id: 't1', year: 2022, documentId: 'incident' },
  { id: 't2', year: 2023, documentId: 'dr-plan' },
  { id: 't3', year: 2024, documentId: 'policy-2024' },
  { id: 't4', year: 2024, documentId: 'k8s-ops' },
  { id: 't5', year: 2024, documentId: 'incident' },
  { id: 't6', year: 2025, documentId: 'policy-2025' },
  { id: 't7', year: 2025, documentId: 'zero-trust' },
  { id: 't8', year: 2025, documentId: 'q3-infra' },
  { id: 't9', year: 2025, documentId: 'devops-cost' },
  { id: 't10', year: 2026, documentId: 'migration' },
]

export const policyChanges: PolicyChange[] = [
  {
    kind: 'changed',
    topic: 'Remote access',
    from: 'Corporate VPN required',
    to: 'Identity-aware proxy',
  },
  {
    kind: 'changed',
    topic: 'Review cadence',
    from: 'Annual access reviews',
    to: 'Continuous review',
  },
  {
    kind: 'changed',
    topic: 'Credentials',
    from: '12-character passwords',
    to: 'Passkeys preferred',
  },
  {
    kind: 'removed',
    topic: 'Perimeter as primary control',
    from: 'Firewall-centric network posture',
  },
  {
    kind: 'added',
    topic: 'Device posture',
    to: 'Posture + SSO mandatory',
  },
  {
    kind: 'added',
    topic: 'Encryption at rest',
    to: 'Required for every document store',
  },
  {
    kind: 'unchanged',
    topic: 'Need-to-know collections',
    from: 'Collections remain access-scoped',
    to: 'Collections remain access-scoped',
  },
]

export const craftDetails = [
  {
    title: 'Typography',
    copy: 'Display serif for thought. Variable sans for the machine. Mono for evidence.',
  },
  {
    title: 'Borders',
    copy: 'Hairlines at 8% white. Never a chunky card outline.',
  },
  {
    title: 'Glass',
    copy: 'Graphite, not frosted plastic. Blur that still reads.',
  },
  {
    title: 'Citation markers',
    copy: 'A page reference is a control, not a footnote graveyard.',
  },
  {
    title: 'Motion',
    copy: 'Ease-out-expo. Short. Purposeful. Disabled when asked.',
  },
  {
    title: 'Spacing',
    copy: 'If it looks expensive, the margins are doing the work.',
  },
]

export const galleryFrames = [
  { id: 'search', title: 'Search interface', caption: 'Ask for meaning' },
  { id: 'answer', title: 'AI answer', caption: 'Grounded, cited, inspectable' },
  { id: 'evidence', title: 'Evidence inspector', caption: 'The trail, opened' },
  { id: 'explorer', title: 'Document explorer', caption: 'A living corpus' },
  { id: 'compare', title: 'Comparison view', caption: 'Across years, not pages' },
  { id: 'graph', title: 'Knowledge graph', caption: 'Concepts in relation' },
  { id: 'timeline', title: 'Timeline', caption: 'Knowledge has a date' },
  { id: 'upload', title: 'Upload flow', caption: 'Drop knowledge here' },
]
