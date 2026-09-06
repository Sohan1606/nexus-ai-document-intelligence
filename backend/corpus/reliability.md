<!-- page: 8 section: Error budget -->
The search SLO consumed 41% of its quarterly error budget in August, almost entirely during the ingest saturation window. Error budget policy pauses feature launches on search if consumption exceeds 50% before the last month of the quarter.

<!-- page: 22 section: Retrieval SLO -->
p95 retrieval latency rose from 42ms to 67ms after the Q2 index expansion. The bottleneck is rerank batching, not vector search. Splitting the reranker across two replicas restores the 50ms budget. FAISS inner-product query time remained under 8ms on NVMe.
