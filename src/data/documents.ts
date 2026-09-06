import type {
  DocumentRecord,
  DocumentStatus,
  Passage,
  SearchHit,
} from '@/types'

type Draft = {
  id: string
  title: string
  type: DocumentRecord['type']
  date: string
  year: number
  pages: number
  chunks: number
  topics: string[]
  collection: string
  collectionId: string
  summary: string
  passages: Passage[]
}

const STATUS: Partial<Record<string, DocumentStatus>> = {
  migration: 'indexing',
  'soc2-notes': 'processing',
  incident: 'attention',
}

const HEALTH: Partial<Record<string, number>> = {
  migration: 86,
  'soc2-notes': 74,
  incident: 61,
}

function pack(d: Draft): DocumentRecord {
  return {
    ...d,
    created: d.date,
    modified: d.date,
    sizeBytes: Math.round(
      d.pages * (d.type === 'pdf' ? 88000 : d.type === 'docx' ? 42000 : 14000),
    ),
    status: STATUS[d.id] ?? 'ready',
    health: HEALTH[d.id] ?? 97,
    sections: [...new Set(d.passages.map((p) => p.section))],
  }
}

const drafts: Draft[] = [
  {
    id: 'q3-infra',
    title: 'Q3 Infrastructure Review',
    type: 'pdf',
    date: '2025-09-12',
    year: 2025,
    pages: 42,
    chunks: 186,
    topics: ['Infrastructure', 'Cost', 'Cloud', 'Scaling'],
    collection: 'Infrastructure',
    collectionId: 'infra',
    summary:
      'Quarterly review of cloud spend, capacity, and reliability across production regions.',
    passages: [
      {
        id: 'q3-p9',
        page: 9,
        section: 'Capacity',
        text: 'Autoscaling lag during the August traffic spike created a 14-minute saturation window on the ingest tier. Horizontal pod autoscaler targets were too conservative for bursty retrieval workloads.',
      },
      {
        id: 'q3-p17',
        page: 17,
        section: 'Cost posture',
        text: 'Cloud infrastructure expenditure increased 18% quarter over quarter, driven primarily by GPU burst capacity and idle staging clusters in eu-central-1. Reserved-instance coverage fell to 61%.',
      },
      {
        id: 'q3-p24',
        page: 24,
        section: 'Risk register',
        text: 'Three primary risks were identified: cloud cost volatility, infrastructure scaling bottlenecks, and security configuration drift across newly provisioned GPU nodes.',
      },
      {
        id: 'q3-p31',
        page: 31,
        section: 'Outlook',
        text: 'Q4 guidance holds spend flat if staging GPUs scale to zero after 20:00 and reserved coverage returns above 80%. Otherwise the run-rate continues to compound.',
      },
    ],
  },
  {
    id: 'cloud-sec',
    title: 'Cloud Security Architecture',
    type: 'pdf',
    date: '2025-06-03',
    year: 2025,
    pages: 68,
    chunks: 240,
    topics: ['Security', 'Cloud', 'Compliance', 'Identity'],
    collection: 'Architecture',
    collectionId: 'arch',
    summary:
      'Reference architecture for identity-aware access, encryption, and workload isolation.',
    passages: [
      {
        id: 'cs-p31',
        page: 31,
        section: 'Identity',
        text: 'Workload identity should replace long-lived keys. Every retrieval service authenticates via short-lived tokens bound to namespace and document collection.',
      },
      {
        id: 'cs-p44',
        page: 44,
        section: 'Drift',
        text: 'Security configuration drift is most acute on ephemeral GPU nodes where baseline hardening is applied late. CIS benchmarks must be baked into the machine image, not the bootstrap script.',
      },
      {
        id: 'cs-p52',
        page: 52,
        section: 'Isolation',
        text: 'Network policies are necessary but insufficient. Document collections must be cryptographic boundaries enforced at retrieval time.',
      },
    ],
  },
  {
    id: 'migration',
    title: 'Platform Migration Strategy',
    type: 'pdf',
    date: '2025-03-18',
    year: 2025,
    pages: 51,
    chunks: 198,
    topics: ['Infrastructure', 'Deployment', 'Kubernetes', 'Cost'],
    collection: 'Architecture',
    collectionId: 'arch',
    summary:
      'Plan for migrating remaining monolith surfaces onto the shared Kubernetes platform.',
    passages: [
      {
        id: 'mig-p12',
        page: 12,
        section: 'Sequencing',
        text: 'Document services move first: they are stateless at the edge and already emit structured traces. Search indexes remain on dedicated nodes until FAISS shards are dual-run for two sprints.',
      },
      {
        id: 'mig-p28',
        page: 28,
        section: 'Kubernetes',
        text: 'The shared cluster becomes the home for retrieval workers. HPA recipes in the operations guide apply; do not autoscale below two reranker replicas.',
      },
    ],
  },
  {
    id: 'incident',
    title: 'Incident Response Playbook',
    type: 'pdf',
    date: '2024-11-22',
    year: 2024,
    pages: 29,
    chunks: 112,
    topics: ['Security', 'Reliability', 'Compliance'],
    collection: 'Operations',
    collectionId: 'ops',
    summary: 'Severity model, comms paths, and evidence preservation steps.',
    passages: [
      {
        id: 'ir-p6',
        page: 6,
        section: 'Sev-1',
        text: 'For document-store exposure, freeze retrieval keys, snapshot audit logs, and notify collection owners within 30 minutes. Do not regenerate embeddings until forensic capture is complete.',
      },
      {
        id: 'ir-p14',
        page: 14,
        section: 'Comms',
        text: 'Legal and collection owners are informed before any public status page. Internal #incidents is the source of truth.',
      },
    ],
  },
  {
    id: 'reliability',
    title: 'Engineering Reliability Report',
    type: 'pdf',
    date: '2025-08-01',
    year: 2025,
    pages: 36,
    chunks: 154,
    topics: ['Reliability', 'Scaling', 'Infrastructure'],
    collection: 'Infrastructure',
    collectionId: 'infra',
    summary: 'SLO review, error budgets, and saturation of retrieval paths.',
    passages: [
      {
        id: 'rel-p22',
        page: 22,
        section: 'Retrieval SLO',
        text: 'p95 retrieval latency rose from 42ms to 67ms after the Q2 index expansion. The bottleneck is rerank batching, not vector search. Splitting the reranker across two replicas restores the 50ms budget.',
      },
      {
        id: 'rel-p8',
        page: 8,
        section: 'Error budget',
        text: 'The search SLO consumed 41% of its quarterly error budget in August, almost entirely during the ingest saturation window.',
      },
    ],
  },
  {
    id: 'devops-cost',
    title: 'DevOps Cost Optimization Report',
    type: 'pdf',
    date: '2025-07-15',
    year: 2025,
    pages: 24,
    chunks: 96,
    topics: ['Cost', 'Cloud', 'Infrastructure', 'Deployment'],
    collection: 'Finance',
    collectionId: 'finance',
    summary: 'Rightsizing, idle resource reaping, and GPU scheduling recommendations.',
    passages: [
      {
        id: 'cost-p8',
        page: 8,
        section: 'Idle capacity',
        text: 'Staging GPU pools accounted for 11% of Q2 spend while utilized 19% of hours. A scheduled scale-to-zero policy after 20:00 local time recovers an estimated 7.4% of monthly infrastructure cost without touching production SLOs.',
      },
      {
        id: 'cost-p14',
        page: 14,
        section: 'Quarterly trend',
        text: 'Infrastructure spending rose 6% in Q1, 9% in Q2, and 18% in Q3. The acceleration is not linear demand — it is ungoverned burst capacity and duplicate observability stacks.',
      },
    ],
  },
  {
    id: 'finops',
    title: 'Platform FinOps Review',
    type: 'pdf',
    date: '2025-10-02',
    year: 2025,
    pages: 19,
    chunks: 72,
    topics: ['Cost', 'Cloud', 'Infrastructure'],
    collection: 'Finance',
    collectionId: 'finance',
    summary:
      'Allocation of platform spend to product lines and a proposed reserved-instance ladder.',
    passages: [
      {
        id: 'fin-p6',
        page: 6,
        section: 'Allocation',
        text: 'Retrieval and embedding jobs now represent 23% of platform compute. GPU burst in Q3 was booked to “shared platform” rather than the teams that triggered it.',
      },
      {
        id: 'fin-p11',
        page: 11,
        section: 'Reserved coverage',
        text: 'A 12-month reserved ladder restoring coverage from 61% to 82% is the highest-confidence FinOps action in the Q3 review.',
      },
    ],
  },
  {
    id: 'zero-trust',
    title: 'Zero Trust Architecture Notes',
    type: 'md',
    date: '2025-01-09',
    year: 2025,
    pages: 18,
    chunks: 74,
    topics: ['Security', 'Identity', 'Zero Trust'],
    collection: 'Architecture',
    collectionId: 'arch',
    summary: 'Working notes on identity-aware proxy, device posture, and document isolation.',
    passages: [
      {
        id: 'zt-p4',
        page: 4,
        section: 'Document isolation',
        text: 'Collections are cryptographic boundaries, not folders. A retriever may only search embeddings minted under the caller’s collection key. Cross-collection answers require an explicit join grant.',
      },
      {
        id: 'zt-p9',
        page: 9,
        section: 'Identity',
        text: 'Identity-aware proxy sits in front of every document surface. Device posture and SSO are mandatory; VPN is no longer a control.',
      },
    ],
  },
  {
    id: 'k8s-ops',
    title: 'Kubernetes Operations Guide',
    type: 'pdf',
    date: '2024-12-04',
    year: 2024,
    pages: 88,
    chunks: 310,
    topics: ['Kubernetes', 'Deployment', 'Scaling', 'Infrastructure'],
    collection: 'Infrastructure',
    collectionId: 'infra',
    summary: 'Cluster topology, HPA recipes, and storage classes for index volumes.',
    passages: [
      {
        id: 'k8s-p41',
        page: 41,
        section: 'Index volumes',
        text: 'FAISS shards live on local NVMe with a nightly snapshot to object storage. Do not place the primary index on network block storage — recall latency becomes dominated by seek time.',
      },
      {
        id: 'k8s-p63',
        page: 63,
        section: 'Scaling',
        text: 'Retrieval deployments autoscale on in-flight rerank batches, not on CPU. A floor of two reranker replicas is required after the Q2 index expansion.',
      },
    ],
  },
  {
    id: 'policy-2024',
    title: 'Security Policy 2024',
    type: 'pdf',
    date: '2024-01-15',
    year: 2024,
    pages: 22,
    chunks: 80,
    topics: ['Security', 'Compliance'],
    collection: 'Security',
    collectionId: 'security',
    summary: 'Perimeter-centric access policy in effect through December 2024.',
    passages: [
      {
        id: 'p24-p3',
        page: 3,
        section: 'Access',
        text: 'Corporate VPN is required for all remote access. Passwords must be at least 12 characters. Access reviews are conducted annually. The perimeter firewall is the primary network control.',
      },
      {
        id: 'p24-p11',
        page: 11,
        section: 'Encryption',
        text: 'Encryption in transit is required. Encryption at rest is recommended for classified stores only.',
      },
    ],
  },
  {
    id: 'policy-2025',
    title: 'Security Policy 2025',
    type: 'pdf',
    date: '2025-01-08',
    year: 2025,
    pages: 27,
    chunks: 94,
    topics: ['Security', 'Compliance', 'Zero Trust', 'Identity'],
    collection: 'Security',
    collectionId: 'security',
    summary: 'Zero-trust revision replacing VPN-centric controls.',
    passages: [
      {
        id: 'p25-p5',
        page: 5,
        section: 'Access',
        text: 'Identity-aware proxy replaces corporate VPN. Device posture and SSO are mandatory. Passkeys are preferred over passwords. Access is reviewed continuously. Encryption at rest is required for every document store.',
      },
      {
        id: 'p25-p12',
        page: 12,
        section: 'Encryption',
        text: 'Encryption at rest is mandatory for every document store, including embeddings and chunk text at rest in the index snapshots.',
      },
    ],
  },
  {
    id: 'dr-plan',
    title: 'Disaster Recovery Strategy',
    type: 'pdf',
    date: '2024-08-19',
    year: 2024,
    pages: 33,
    chunks: 121,
    topics: ['Reliability', 'Infrastructure', 'Compliance'],
    collection: 'Operations',
    collectionId: 'ops',
    summary: 'RPO/RTO targets for search indexes and document blobs.',
    passages: [
      {
        id: 'dr-p11',
        page: 11,
        section: 'Search',
        text: 'Index RPO is 24 hours via object-storage snapshots. Document blob RPO is 15 minutes. Reconstruction of a full FAISS corpus is estimated at 47 minutes for the current 12 million chunk estate.',
      },
      {
        id: 'dr-p19',
        page: 19,
        section: 'Procedure',
        text: 'On region loss: promote the object-storage snapshot, rebuild FAISS on NVMe, restore blob RPO, then re-enable retrieval. Do not serve answers until citation IDs resolve.',
      },
    ],
  },
  {
    id: 'soc2-notes',
    title: 'Assurance Readiness Notes',
    type: 'docx',
    date: '2025-04-02',
    year: 2025,
    pages: 14,
    chunks: 58,
    topics: ['Compliance', 'Security'],
    collection: 'Security',
    collectionId: 'security',
    summary:
      'Internal working notes on audit evidence, logging, and document retention. Not a certification claim.',
    passages: [
      {
        id: 'soc-p7',
        page: 7,
        section: 'Evidence',
        text: 'Retrieval logs must retain query, collection, document IDs, and citation IDs for 365 days. Raw document bytes remain in the originating store — the index holds embeddings and chunk text only.',
      },
    ],
  },
]

export const documents: DocumentRecord[] = drafts.map(pack)

export const documentById = Object.fromEntries(
  documents.map((d) => [d.id, d]),
) as Record<string, DocumentRecord>

export function passagesAround(docId: string, page: number) {
  const doc = documentById[docId]
  if (!doc) return { prev: undefined, next: undefined, current: undefined }
  const sorted = [...doc.passages].sort((a, b) => a.page - b.page)
  const i = sorted.findIndex((p) => p.page === page)
  return {
    current: i >= 0 ? sorted[i] : undefined,
    prev: i > 0 ? sorted[i - 1] : undefined,
    next: i >= 0 && i < sorted.length - 1 ? sorted[i + 1] : undefined,
  }
}

export const heroFragments: SearchHit[] = [
  {
    documentId: 'q3-infra',
    title: 'Q3 Infrastructure Review',
    page: 17,
    section: 'Cost posture',
    relevance: 0.94,
    concept: 'cost optimization',
    snippet: 'Cloud infrastructure expenditure increased 18% QoQ…',
    type: 'pdf',
    collection: 'Infrastructure',
    mode: 'semantic',
  },
  {
    documentId: 'devops-cost',
    title: 'DevOps Cost Optimization Report',
    page: 8,
    section: 'Idle capacity',
    relevance: 0.91,
    concept: 'idle GPU pools',
    snippet: 'Staging GPU pools accounted for 11% of Q2 spend…',
    type: 'pdf',
    collection: 'Finance',
    mode: 'semantic',
  },
  {
    documentId: 'cloud-sec',
    title: 'Cloud Security Architecture',
    page: 44,
    section: 'Drift',
    relevance: 0.62,
    concept: 'configuration drift',
    snippet: 'Drift is most acute on ephemeral GPU nodes…',
    type: 'pdf',
    collection: 'Architecture',
    mode: 'semantic',
  },
  {
    documentId: 'reliability',
    title: 'Engineering Reliability Report',
    page: 22,
    section: 'Retrieval SLO',
    relevance: 0.71,
    concept: 'retrieval latency',
    snippet: 'p95 retrieval latency rose from 42ms to 67ms…',
    type: 'pdf',
    collection: 'Infrastructure',
    mode: 'semantic',
  },
  {
    documentId: 'k8s-ops',
    title: 'Kubernetes Operations Guide',
    page: 41,
    section: 'Index volumes',
    relevance: 0.48,
    concept: 'index storage',
    snippet: 'FAISS shards live on local NVMe…',
    type: 'pdf',
    collection: 'Infrastructure',
    mode: 'semantic',
  },
  {
    documentId: 'zero-trust',
    title: 'Zero Trust Architecture Notes',
    page: 4,
    section: 'Document isolation',
    relevance: 0.55,
    concept: 'document isolation',
    snippet: 'Collections are cryptographic boundaries…',
    type: 'md',
    collection: 'Architecture',
    mode: 'semantic',
  },
  {
    documentId: 'migration',
    title: 'Platform Migration Strategy',
    page: 12,
    section: 'Sequencing',
    relevance: 0.44,
    concept: 'dual-run indexes',
    snippet: 'Search indexes remain on dedicated nodes…',
    type: 'pdf',
    collection: 'Architecture',
    mode: 'semantic',
  },
  {
    documentId: 'incident',
    title: 'Incident Response Playbook',
    page: 6,
    section: 'Sev-1',
    relevance: 0.33,
    concept: 'key freeze',
    snippet: 'Freeze retrieval keys, snapshot audit logs…',
    type: 'pdf',
    collection: 'Operations',
    mode: 'semantic',
  },
]

export const knowledgeTypes = [
  'PDFs',
  'research papers',
  'contracts',
  'reports',
  'technical documentation',
  'meeting notes',
  'spreadsheets',
  'internal knowledge',
]
