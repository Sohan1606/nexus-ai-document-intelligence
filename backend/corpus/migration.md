<!-- page: 12 section: Sequencing -->
Document services move first: they are stateless at the edge and already emit structured traces. Search indexes remain on dedicated nodes until FAISS shards are dual-run for two sprints. Do not cut over retrieval until citation IDs resolve in the shadow cluster.

<!-- page: 28 section: Kubernetes -->
The shared cluster becomes the home for retrieval workers. HPA recipes in the operations guide apply; do not autoscale below two reranker replicas. Dual-run FAISS for two sprints, then retire the dedicated index nodes.
