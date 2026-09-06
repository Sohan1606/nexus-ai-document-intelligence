from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "corpus"

DOCS: dict[str, str] = {
    "q3-infra.md": """<!-- page: 9 section: Capacity -->
Autoscaling lag during the August traffic spike created a 14-minute saturation window on the ingest tier. Horizontal pod autoscaler targets were too conservative for bursty retrieval workloads. The ingest fleet queued requests while CPU sat idle on adjacent pools that were not part of the same HPA group. Capacity planning for Q3 assumed a smooth diurnal curve; the spike was a product launch plus a retry storm.

Operators should split retrieval workers from ingest and raise the HPA target only for the retrieval deployment. Do not raise cluster-wide CPU requests — that recreates the idle staging cost problem.

<!-- page: 17 section: Cost posture -->
Cloud infrastructure expenditure increased 18% quarter over quarter, driven primarily by GPU burst capacity and idle staging clusters in eu-central-1. Reserved-instance coverage fell to 61%. Finance tagged GPU burst to the shared platform rather than the teams that triggered it, which hid the true unit cost of retrieval experiments.

A 12-month reserved ladder and a scale-to-zero policy for staging GPUs after 20:00 are the two highest-leverage actions. Without them the run-rate continues to compound into Q4.

<!-- page: 24 section: Risk register -->
Three primary risks were identified: cloud cost volatility, infrastructure scaling bottlenecks, and security configuration drift across newly provisioned GPU nodes. Drift is most acute when images are not baked with CIS baselines. Cost volatility tracks GPU spot interruptions and ungoverned burst.

<!-- page: 31 section: Outlook -->
Q4 guidance holds spend flat if staging GPUs scale to zero after 20:00 and reserved coverage returns above 80%. Otherwise the run-rate continues to compound. Reliability owns the autoscaling lag item; FinOps owns reserved coverage.
""",
    "cloud-sec.md": """<!-- page: 31 section: Identity -->
Workload identity should replace long-lived keys. Every retrieval service authenticates via short-lived tokens bound to namespace and document collection. Static cloud keys in CI are a sev-2 finding. Rotate remaining keys within 30 days and bind new tokens to the collection the worker is allowed to search.

<!-- page: 44 section: Drift -->
Security configuration drift is most acute on ephemeral GPU nodes where baseline hardening is applied late. CIS benchmarks must be baked into the machine image, not the bootstrap script. Nodes that skip the image bake inherit last week's kernel and miss network policy defaults.

<!-- page: 52 section: Isolation -->
Network policies are necessary but insufficient. Document collections must be cryptographic boundaries enforced at retrieval time. A retriever may only search embeddings minted under the caller’s collection key. Cross-collection answers require an explicit join grant.
""",
    "migration.md": """<!-- page: 12 section: Sequencing -->
Document services move first: they are stateless at the edge and already emit structured traces. Search indexes remain on dedicated nodes until FAISS shards are dual-run for two sprints. Do not cut over retrieval until citation IDs resolve in the shadow cluster.

<!-- page: 28 section: Kubernetes -->
The shared cluster becomes the home for retrieval workers. HPA recipes in the operations guide apply; do not autoscale below two reranker replicas. Dual-run FAISS for two sprints, then retire the dedicated index nodes.
""",
    "incident.md": """<!-- page: 6 section: Sev-1 -->
For document-store exposure, freeze retrieval keys, snapshot audit logs, and notify collection owners within 30 minutes. Do not regenerate embeddings until forensic capture is complete. Evidence preservation beats availability for sev-1 document leaks.

<!-- page: 14 section: Comms -->
Legal and collection owners are informed before any public status page. Internal #incidents is the source of truth. Do not discuss suspected document exposure on social channels.
""",
    "reliability.md": """<!-- page: 8 section: Error budget -->
The search SLO consumed 41% of its quarterly error budget in August, almost entirely during the ingest saturation window. Error budget policy pauses feature launches on search if consumption exceeds 50% before the last month of the quarter.

<!-- page: 22 section: Retrieval SLO -->
p95 retrieval latency rose from 42ms to 67ms after the Q2 index expansion. The bottleneck is rerank batching, not vector search. Splitting the reranker across two replicas restores the 50ms budget. FAISS inner-product query time remained under 8ms on NVMe.
""",
    "devops-cost.md": """<!-- page: 8 section: Idle capacity -->
Staging GPU pools accounted for 11% of Q2 spend while utilized 19% of hours. A scheduled scale-to-zero policy after 20:00 local time recovers an estimated 7.4% of monthly infrastructure cost without touching production SLOs.

<!-- page: 14 section: Quarterly trend -->
Infrastructure spending rose 6% in Q1, 9% in Q2, and 18% in Q3. The acceleration is not linear demand — it is ungoverned burst capacity and duplicate observability stacks. Tie this trend to reserved-instance coverage falling to 61%.
""",
    "finops.md": """<!-- page: 6 section: Allocation -->
Retrieval and embedding jobs now represent 23% of platform compute. GPU burst in Q3 was booked to “shared platform” rather than the teams that triggered it. Allocation must follow the job, not the cluster name.

<!-- page: 11 section: Reserved coverage -->
A 12-month reserved ladder restoring coverage from 61% to 82% is the highest-confidence FinOps action in the Q3 review. Combine it with staging GPU scale-to-zero after 20:00.
""",
    "zero-trust.md": """<!-- page: 4 section: Document isolation -->
Collections are cryptographic boundaries, not folders. A retriever may only search embeddings minted under the caller’s collection key. Cross-collection answers require an explicit join grant. Folder ACLs are not a substitute.

<!-- page: 9 section: Identity -->
Identity-aware proxy sits in front of every document surface. Device posture and SSO are mandatory; VPN is no longer a control. Passkeys are preferred over passwords for operators of the retrieval plane.
""",
    "k8s-ops.md": """<!-- page: 41 section: Index volumes -->
FAISS shards live on local NVMe with a nightly snapshot to object storage. Do not place the primary index on network block storage — recall latency becomes dominated by seek time. Reconstruction from object storage is the disaster-recovery path, not the hot path.

<!-- page: 63 section: Scaling -->
Retrieval deployments autoscale on in-flight rerank batches, not on CPU. A floor of two reranker replicas is required after the Q2 index expansion. HPA recipes here apply to the shared cluster used by the migration program.
""",
    "policy-2024.md": """<!-- page: 3 section: Access -->
Corporate VPN is required for all remote access. Passwords must be at least 12 characters. Access reviews are conducted annually. The perimeter firewall is the primary network control. This policy is in effect through December 2024.

<!-- page: 11 section: Encryption -->
Encryption in transit is required. Encryption at rest is recommended for classified stores only. Embeddings are treated as derived data and follow the source classification.
""",
    "policy-2025.md": """<!-- page: 5 section: Access -->
Identity-aware proxy replaces corporate VPN. Device posture and SSO are mandatory. Passkeys are preferred over passwords. Access is reviewed continuously. Encryption at rest is required for every document store. This is the zero-trust revision of the 2024 policy.

<!-- page: 12 section: Encryption -->
Encryption at rest is mandatory for every document store, including embeddings and chunk text at rest in the index snapshots. Transit encryption remains required. VPN is no longer accepted as a compensating control.
""",
    "dr-plan.md": """<!-- page: 11 section: Search -->
Index RPO is 24 hours via object-storage snapshots. Document blob RPO is 15 minutes. Reconstruction of a full FAISS corpus is estimated at 47 minutes for the current 12 million chunk estate. Serve no answers until citation IDs resolve.

<!-- page: 19 section: Procedure -->
On region loss: promote the object-storage snapshot, rebuild FAISS on NVMe, restore blob RPO, then re-enable retrieval. Do not serve answers until citation IDs resolve. The Kubernetes operations guide describes NVMe placement for the rebuilt shards.
""",
    "soc2-notes.md": """<!-- page: 7 section: Evidence -->
Retrieval logs must retain query, collection, document IDs, and citation IDs for 365 days. Raw document bytes remain in the originating store — the index holds embeddings and chunk text only. These are internal working notes on audit evidence. This document is not a certification claim.
""",
}


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    for name, body in DOCS.items():
        (ROOT / name).write_text(body.strip() + "\n", encoding="utf-8")
    print(f"wrote {len(DOCS)} files to {ROOT}")


if __name__ == "__main__":
    main()
