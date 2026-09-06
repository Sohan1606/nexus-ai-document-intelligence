import type { AskResult, Evidence, PromptScript } from '@/types'
import { ragPhases, demoTrace } from './retrieval'
import { passagesAround } from './documents'

function withContext(ev: Evidence): Evidence {
  const ctx = passagesAround(ev.documentId, ev.page)
  return {
    ...ev,
    prevPassage: ctx.prev?.text,
    nextPassage: ctx.next?.text,
  }
}

const evidence = {
  q3risk: withContext({
    id: 'ev-q3-24',
    documentId: 'q3-infra',
    documentTitle: 'Q3 Infrastructure Review',
    page: 24,
    section: 'Risk register',
    passage:
      'Three primary risks were identified: cloud cost volatility, infrastructure scaling bottlenecks, and security configuration drift across newly provisioned GPU nodes.',
    highlight:
      'cloud cost volatility, infrastructure scaling bottlenecks, and security configuration drift',
    similarity: 0.94,
    confidence: 'HIGH',
  }),
  q3cost: withContext({
    id: 'ev-q3-17',
    documentId: 'q3-infra',
    documentTitle: 'Q3 Infrastructure Review',
    page: 17,
    section: 'Cost posture',
    passage:
      'Cloud infrastructure expenditure increased 18% quarter over quarter, driven primarily by GPU burst capacity and idle staging clusters in eu-central-1. Reserved-instance coverage fell to 61%.',
    highlight: 'increased 18% quarter over quarter',
    similarity: 0.93,
    confidence: 'HIGH',
  }),
  costTrend: withContext({
    id: 'ev-cost-14',
    documentId: 'devops-cost',
    documentTitle: 'DevOps Cost Optimization Report',
    page: 14,
    section: 'Quarterly trend',
    passage:
      'Infrastructure spending rose 6% in Q1, 9% in Q2, and 18% in Q3. The acceleration is not linear demand — it is ungoverned burst capacity and duplicate observability stacks.',
    highlight: 'rose 6% in Q1, 9% in Q2, and 18% in Q3',
    similarity: 0.91,
    confidence: 'HIGH',
  }),
  idle: withContext({
    id: 'ev-cost-8',
    documentId: 'devops-cost',
    documentTitle: 'DevOps Cost Optimization Report',
    page: 8,
    section: 'Idle capacity',
    passage:
      'Staging GPU pools accounted for 11% of Q2 spend while utilized 19% of hours. A scheduled scale-to-zero policy after 20:00 local time recovers an estimated 7.4% of monthly infrastructure cost without touching production SLOs.',
    highlight: 'recovers an estimated 7.4% of monthly infrastructure cost',
    similarity: 0.88,
    confidence: 'HIGH',
  }),
  drift: withContext({
    id: 'ev-cs-44',
    documentId: 'cloud-sec',
    documentTitle: 'Cloud Security Architecture',
    page: 44,
    section: 'Drift',
    passage:
      'Security configuration drift is most acute on ephemeral GPU nodes where baseline hardening is applied late. CIS benchmarks must be baked into the machine image, not the bootstrap script.',
    highlight: 'baked into the machine image, not the bootstrap script',
    similarity: 0.86,
    confidence: 'HIGH',
  }),
  policy24: withContext({
    id: 'ev-p24',
    documentId: 'policy-2024',
    documentTitle: 'Security Policy 2024',
    page: 3,
    section: 'Access',
    passage:
      'Corporate VPN is required for all remote access. Passwords must be at least 12 characters. Access reviews are conducted annually. The perimeter firewall is the primary network control.',
    highlight: 'Corporate VPN is required for all remote access',
    similarity: 0.9,
    confidence: 'HIGH',
  }),
  policy25: withContext({
    id: 'ev-p25',
    documentId: 'policy-2025',
    documentTitle: 'Security Policy 2025',
    page: 5,
    section: 'Access',
    passage:
      'Identity-aware proxy replaces corporate VPN. Device posture and SSO are mandatory. Passkeys are preferred over passwords. Access is reviewed continuously. Encryption at rest is required for every document store.',
    highlight: 'Identity-aware proxy replaces corporate VPN',
    similarity: 0.93,
    confidence: 'HIGH',
  }),
  policy24enc: withContext({
    id: 'ev-p24-enc',
    documentId: 'policy-2024',
    documentTitle: 'Security Policy 2024',
    page: 11,
    section: 'Encryption',
    passage:
      'Encryption in transit is required. Encryption at rest is recommended for classified stores only.',
    highlight: 'recommended for classified stores only',
    similarity: 0.84,
    confidence: 'MEDIUM',
  }),
  policy25enc: withContext({
    id: 'ev-p25-enc',
    documentId: 'policy-2025',
    documentTitle: 'Security Policy 2025',
    page: 12,
    section: 'Encryption',
    passage:
      'Encryption at rest is mandatory for every document store, including embeddings and chunk text at rest in the index snapshots.',
    highlight: 'mandatory for every document store',
    similarity: 0.9,
    confidence: 'HIGH',
  }),
  k8s: withContext({
    id: 'ev-k8s',
    documentId: 'k8s-ops',
    documentTitle: 'Kubernetes Operations Guide',
    page: 41,
    section: 'Index volumes',
    passage:
      'FAISS shards live on local NVMe with a nightly snapshot to object storage. Do not place the primary index on network block storage — recall latency becomes dominated by seek time.',
    highlight: 'FAISS shards live on local NVMe',
    similarity: 0.89,
    confidence: 'HIGH',
  }),
  k8sScale: withContext({
    id: 'ev-k8s-63',
    documentId: 'k8s-ops',
    documentTitle: 'Kubernetes Operations Guide',
    page: 63,
    section: 'Scaling',
    passage:
      'Retrieval deployments autoscale on in-flight rerank batches, not on CPU. A floor of two reranker replicas is required after the Q2 index expansion.',
    highlight: 'floor of two reranker replicas',
    similarity: 0.87,
    confidence: 'HIGH',
  }),
  isolation: withContext({
    id: 'ev-zt',
    documentId: 'zero-trust',
    documentTitle: 'Zero Trust Architecture Notes',
    page: 4,
    section: 'Document isolation',
    passage:
      'Collections are cryptographic boundaries, not folders. A retriever may only search embeddings minted under the caller’s collection key. Cross-collection answers require an explicit join grant.',
    highlight: 'Collections are cryptographic boundaries, not folders',
    similarity: 0.87,
    confidence: 'HIGH',
  }),
  dr: withContext({
    id: 'ev-dr',
    documentId: 'dr-plan',
    documentTitle: 'Disaster Recovery Strategy',
    page: 11,
    section: 'Search',
    passage:
      'Index RPO is 24 hours via object-storage snapshots. Document blob RPO is 15 minutes. Reconstruction of a full FAISS corpus is estimated at 47 minutes for the current 12 million chunk estate.',
    highlight: 'Index RPO is 24 hours via object-storage snapshots',
    similarity: 0.92,
    confidence: 'HIGH',
  }),
  drProc: withContext({
    id: 'ev-dr-19',
    documentId: 'dr-plan',
    documentTitle: 'Disaster Recovery Strategy',
    page: 19,
    section: 'Procedure',
    passage:
      'On region loss: promote the object-storage snapshot, rebuild FAISS on NVMe, restore blob RPO, then re-enable retrieval. Do not serve answers until citation IDs resolve.',
    highlight: 'Do not serve answers until citation IDs resolve',
    similarity: 0.88,
    confidence: 'HIGH',
  }),
  latency: withContext({
    id: 'ev-rel',
    documentId: 'reliability',
    documentTitle: 'Engineering Reliability Report',
    page: 22,
    section: 'Retrieval SLO',
    passage:
      'p95 retrieval latency rose from 42ms to 67ms after the Q2 index expansion. The bottleneck is rerank batching, not vector search. Splitting the reranker across two replicas restores the 50ms budget.',
    highlight: 'The bottleneck is rerank batching, not vector search',
    similarity: 0.84,
    confidence: 'MEDIUM',
  }),
  finops: withContext({
    id: 'ev-fin',
    documentId: 'finops',
    documentTitle: 'Platform FinOps Review',
    page: 11,
    section: 'Reserved coverage',
    passage:
      'A 12-month reserved ladder restoring coverage from 61% to 82% is the highest-confidence FinOps action in the Q3 review.',
    highlight: 'restoring coverage from 61% to 82%',
    similarity: 0.85,
    confidence: 'HIGH',
  }),
} satisfies Record<string, Evidence>

const stages = ragPhases

function result(
  partial: Omit<AskResult, 'id' | 'question' | 'demo' | 'stages'> & {
    stages?: AskResult['stages']
  },
): Omit<AskResult, 'id' | 'question'> {
  return {
    demo: true,
    stages: partial.stages ?? stages,
    ...partial,
  }
}

export const promptScripts: PromptScript[] = [
  {
    prompt: 'What are the largest infrastructure risks?',
    result: result({
      answer:
        'Three primary risks recur across the Q3 infrastructure review and the security architecture notes: cloud cost volatility from burst GPU capacity [1], infrastructure scaling bottlenecks on ingest and retrieval [2], and security configuration drift on newly provisioned GPU nodes [3].',
      bullets: [
        'Cloud cost volatility from burst GPU capacity and idle staging pools',
        'Infrastructure scaling bottlenecks on the ingest and retrieval tiers',
        'Security configuration drift on newly provisioned GPU nodes',
      ],
      citations: [evidence.q3risk, evidence.q3cost, evidence.drift],
      claims: [
        { id: 'c1', text: 'Cloud cost volatility from burst GPU capacity', supported: true, evidenceIds: ['ev-q3-24', 'ev-q3-17'] },
        { id: 'c2', text: 'Scaling bottlenecks on ingest and retrieval', supported: true, evidenceIds: ['ev-q3-24'] },
        { id: 'c3', text: 'Configuration drift on GPU nodes', supported: true, evidenceIds: ['ev-cs-44'] },
        { id: 'c4', text: 'A fabricated vendor outage last Tuesday', supported: false, evidenceIds: [] },
      ],
      relatedDocumentIds: ['q3-infra', 'cloud-sec', 'devops-cost'],
      trace: demoTrace(48, 12, 5, 3),
    }),
  },
  {
    prompt: 'What are the main risks identified across the infrastructure reports?',
    result: result({
      answer:
        'Across the Q3 infrastructure review and supporting security architecture notes, three primary risks were identified [1]. They are consistent across cost, reliability, and hardening documents in the demo workspace.',
      bullets: [
        'Cloud cost volatility from burst GPU capacity and idle staging pools',
        'Infrastructure scaling bottlenecks on the ingest and retrieval tiers',
        'Security configuration drift on newly provisioned GPU nodes',
      ],
      citations: [evidence.q3risk, evidence.drift, evidence.idle],
      claims: [
        { id: 'c1', text: 'Cloud cost volatility from burst GPU capacity', supported: true, evidenceIds: ['ev-q3-24'] },
        { id: 'c2', text: 'Scaling bottlenecks on ingest', supported: true, evidenceIds: ['ev-q3-24'] },
        { id: 'c3', text: 'Configuration drift on GPU nodes', supported: true, evidenceIds: ['ev-cs-44'] },
      ],
      relatedDocumentIds: ['q3-infra', 'cloud-sec', 'devops-cost'],
      trace: demoTrace(48, 12, 5, 3),
    }),
  },
  {
    prompt: 'How did cloud costs change?',
    result: result({
      answer:
        'Infrastructure spending accelerated through the year rather than growing with demand. The corpus shows a 6% rise in Q1, 9% in Q2, and 18% in Q3 [1]. Q3 itself records an 18% quarter-over-quarter increase driven by GPU burst and idle staging [2]. The highest-confidence levers are staging scale-to-zero (~7.4% monthly) [3] and restoring reserved coverage from 61% to 82% [4].',
      citations: [evidence.costTrend, evidence.q3cost, evidence.idle, evidence.finops],
      relatedDocumentIds: ['devops-cost', 'q3-infra', 'finops'],
      trace: demoTrace(52, 14, 6, 3),
    }),
  },
  {
    prompt: 'How did infrastructure spending change over the last three quarters?',
    result: result({
      answer:
        'Infrastructure spending rose 6% in Q1, 9% in Q2, and 18% in Q3 [1]. The acceleration is attributed to ungoverned burst capacity, duplicate observability stacks, and idle GPU pools rather than linear product growth [2].',
      citations: [evidence.costTrend, evidence.idle, evidence.q3cost],
      relatedDocumentIds: ['devops-cost', 'q3-infra'],
      trace: demoTrace(48, 12, 5, 2),
    }),
  },
  {
    prompt: 'Compare the 2024 and 2025 security policies.',
    result: result({
      answer:
        'The 2025 policy replaces a perimeter model with zero trust. VPN-mandatory access becomes an identity-aware proxy [1][2]; annual reviews become continuous; passwords give way to passkeys; and encryption at rest moves from “recommended for classified stores” to mandatory for every document store [3][4].',
      bullets: [
        'Added: identity-aware proxy, device posture, passkeys, continuous review, encryption at rest',
        'Removed: corporate VPN as the primary remote-access path',
        'Changed: firewall-centric control → identity-centric control',
      ],
      citations: [evidence.policy24, evidence.policy25, evidence.policy24enc, evidence.policy25enc],
      relatedDocumentIds: ['policy-2024', 'policy-2025', 'zero-trust'],
      comparison: true,
      trace: demoTrace(32, 10, 4, 2),
    }),
  },
  {
    prompt: 'What changed between the 2024 and 2025 security policies?',
    result: result({
      answer:
        'The 2025 policy replaces a perimeter model with zero trust. VPN-mandatory access becomes an identity-aware proxy [1][2]; annual reviews become continuous; passwords give way to passkeys; and encryption at rest is required for every document store.',
      bullets: [
        'Added: identity-aware proxy, device posture, passkeys, continuous review, encryption at rest',
        'Removed: corporate VPN as the primary remote-access path',
        'Changed: firewall-centric control → identity-centric control',
      ],
      citations: [evidence.policy24, evidence.policy25],
      relatedDocumentIds: ['policy-2024', 'policy-2025'],
      comparison: true,
      trace: demoTrace(32, 10, 4, 2),
    }),
  },
  {
    prompt: 'Where is the disaster recovery procedure?',
    result: result({
      answer:
        'The Disaster Recovery Strategy lives in the Operations collection (19 Aug 2024). For search, index RPO is 24 hours via object-storage snapshots; document blob RPO is 15 minutes [1]. On region loss: promote the snapshot, rebuild FAISS on NVMe, restore blobs, then re-enable retrieval — and do not serve answers until citation IDs resolve [2].',
      citations: [evidence.dr, evidence.drProc],
      relatedDocumentIds: ['dr-plan', 'k8s-ops'],
      trace: demoTrace(16, 6, 3, 1),
    }),
  },
  {
    prompt: 'Where is the disaster recovery plan?',
    result: result({
      answer:
        'The Disaster Recovery Strategy is in the Operations collection (dated 19 Aug 2024). For search, index RPO is 24 hours via object-storage snapshots; document blob RPO is 15 minutes [1]. Full FAISS reconstruction is estimated at 47 minutes in the demo figures.',
      citations: [evidence.dr, evidence.drProc],
      relatedDocumentIds: ['dr-plan'],
      trace: demoTrace(16, 6, 3, 1),
    }),
  },
  {
    prompt: 'Which documents mention Kubernetes scaling?',
    result: result({
      answer:
        'Kubernetes scaling is specified in the operations guide and the reliability report. Retrieval deployments autoscale on in-flight rerank batches with a floor of two reranker replicas [1]. After the Q2 index expansion, p95 retrieval rose from 42ms to 67ms because rerank batching — not vector search — saturated [2]. The migration strategy places retrieval workers on the shared cluster and forbids scaling below that floor [3].',
      citations: [evidence.k8sScale, evidence.latency, evidence.k8s],
      relatedDocumentIds: ['k8s-ops', 'reliability', 'migration'],
      trace: demoTrace(40, 11, 5, 3),
    }),
  },
  {
    prompt: 'Find all references to Kubernetes.',
    result: result({
      answer:
        'Kubernetes is the shared platform for remaining monolith surfaces and the home for retrieval workloads. Index volumes live on local NVMe [1]; FAISS shards should not sit on network block storage because recall latency becomes seek-bound. Scaling is driven by rerank batches, not CPU [2].',
      citations: [evidence.k8s, evidence.k8sScale, evidence.latency],
      relatedDocumentIds: ['k8s-ops', 'migration', 'reliability'],
      trace: demoTrace(40, 11, 5, 3),
    }),
  },
  {
    prompt: 'Summarize the security policy.',
    result: result({
      answer:
        'The current (2025) security policy is identity-first. Access is mediated by SSO and device posture through an identity-aware proxy [1]. Passkeys are preferred. Access is reviewed continuously, and every document store must be encrypted at rest. The 2024 policy it replaces was VPN- and perimeter-firewall-centric [2].',
      citations: [evidence.policy25, evidence.policy24, evidence.isolation],
      relatedDocumentIds: ['policy-2025', 'policy-2024', 'zero-trust'],
      trace: demoTrace(24, 8, 4, 3),
    }),
  },
  {
    prompt: 'Compare the two architecture reports.',
    result: result({
      answer:
        'Cloud Security Architecture and Zero Trust Architecture Notes agree that collections are isolation boundaries [1] and that workload identity should replace long-lived keys. The security architecture is prescriptive about image hardening [2]; the zero-trust notes are prescriptive about retrieval grants.',
      citations: [evidence.isolation, evidence.drift],
      relatedDocumentIds: ['cloud-sec', 'zero-trust'],
      trace: demoTrace(28, 9, 4, 2),
    }),
  },
  {
    prompt: 'Which document mentions SOC 2?',
    result: result({
      answer:
        'No document in this demo workspace claims a SOC 2 certification. Assurance Readiness Notes discuss audit-style evidence retention (query logs, collection IDs, citation IDs for 365 days) as internal working material only.',
      citations: [],
      relatedDocumentIds: ['soc2-notes'],
      trace: demoTrace(16, 4, 1, 1),
    }),
  },
  {
    prompt: 'Show me every reference to infrastructure cost optimization.',
    result: result({
      answer:
        'Cost optimization is concentrated in the DevOps Cost Optimization Report, the Q3 Infrastructure Review, and the Platform FinOps Review. The highest-confidence levers are scheduled scale-to-zero on staging GPUs (about 7.4% monthly) [1] and restoring reserved-instance coverage from 61% to 82% [2].',
      citations: [evidence.idle, evidence.finops, evidence.q3cost],
      relatedDocumentIds: ['devops-cost', 'finops', 'q3-infra'],
      trace: demoTrace(48, 12, 5, 3),
    }),
  },
  {
    prompt: 'Where did infrastructure costs increase?',
    result: result({
      answer:
        'The increase is documented in Q3: cloud infrastructure expenditure rose 18% quarter over quarter, driven by GPU burst capacity and idle staging in eu-central-1 [1]. Across the year the same acceleration appears as 6% → 9% → 18% [2].',
      citations: [evidence.q3cost, evidence.costTrend],
      relatedDocumentIds: ['q3-infra', 'devops-cost'],
      trace: demoTrace(36, 10, 4, 2),
    }),
  },
]

export const allEvidence: Evidence[] = Object.values(evidence)

export const defaultPrompt = promptScripts[0]

export const commandPrompts = [
  'What are the largest infrastructure risks?',
  'Compare the 2024 and 2025 security policies.',
  'Where is the disaster recovery procedure?',
  'How did cloud costs change?',
  'Which documents mention Kubernetes scaling?',
]

export const recommendedQueries = commandPrompts

export const demoScenarios = [
  {
    id: 'risks',
    label: 'Infrastructure risks',
    prompt: 'What are the largest infrastructure risks?',
  },
  {
    id: 'policy',
    label: 'Policy comparison',
    prompt: 'Compare the 2024 and 2025 security policies.',
  },
  {
    id: 'dr',
    label: 'Disaster recovery',
    prompt: 'Where is the disaster recovery procedure?',
  },
  {
    id: 'cost',
    label: 'Cloud costs',
    prompt: 'How did cloud costs change?',
  },
  {
    id: 'k8s',
    label: 'Kubernetes scaling',
    prompt: 'Which documents mention Kubernetes scaling?',
  },
]

export function matchPrompt(query: string): PromptScript {
  const q = query.trim().toLowerCase()
  const exact = promptScripts.find((p) => p.prompt.toLowerCase() === q)
  if (exact) return exact

  const scored = promptScripts
    .map((p) => {
      const words = q.split(/\s+/).filter((w) => w.length > 3)
      const hay = (p.prompt + ' ' + p.result.answer).toLowerCase()
      const hits = words.filter((w) => hay.includes(w)).length
      return { p, hits }
    })
    .sort((a, b) => b.hits - a.hits)

  if (scored[0] && scored[0].hits >= 2) return scored[0].p

  return {
    prompt: query,
    result: result({
      answer:
        'In this local demonstration, NEXUS answers from a fixed demo corpus. The closest grounded reading is that infrastructure cost, scaling, and configuration drift are the recurring themes across the indexed reports. Try a suggested scenario for a fully cited walkthrough.',
      citations: [evidence.q3risk, evidence.costTrend],
      relatedDocumentIds: ['q3-infra', 'devops-cost'],
      trace: demoTrace(),
    }),
  }
}
