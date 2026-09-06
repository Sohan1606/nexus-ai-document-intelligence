<!-- page: 41 section: Index volumes -->
FAISS shards live on local NVMe with a nightly snapshot to object storage. Do not place the primary index on network block storage — recall latency becomes dominated by seek time. Reconstruction from object storage is the disaster-recovery path, not the hot path.

<!-- page: 63 section: Scaling -->
Retrieval deployments autoscale on in-flight rerank batches, not on CPU. A floor of two reranker replicas is required after the Q2 index expansion. HPA recipes here apply to the shared cluster used by the migration program.
