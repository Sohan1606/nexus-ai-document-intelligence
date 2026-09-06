<!-- page: 31 section: Identity -->
Workload identity should replace long-lived keys. Every retrieval service authenticates via short-lived tokens bound to namespace and document collection. Static cloud keys in CI are a sev-2 finding. Rotate remaining keys within 30 days and bind new tokens to the collection the worker is allowed to search.

<!-- page: 44 section: Drift -->
Security configuration drift is most acute on ephemeral GPU nodes where baseline hardening is applied late. CIS benchmarks must be baked into the machine image, not the bootstrap script. Nodes that skip the image bake inherit last week's kernel and miss network policy defaults.

<!-- page: 52 section: Isolation -->
Network policies are necessary but insufficient. Document collections must be cryptographic boundaries enforced at retrieval time. A retriever may only search embeddings minted under the caller’s collection key. Cross-collection answers require an explicit join grant.
