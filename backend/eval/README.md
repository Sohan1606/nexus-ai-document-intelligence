# Evaluation

These metrics are **local prototype measurements** on the bundled seed corpus.

They are **not**:

- production SLOs
- claims about general RAG quality
- vendor or leaderboard scores

## Last measured run (this workspace)

| Field | Value |
| --- | --- |
| When | 2026-09-06 |
| n | 14 queries / 13 docs / 28 chunks |
| Embeddings | hash-ngram, 384-d (**lexical**, not SBERT) |
| Retrieval | hybrid 0.7 FAISS IP + 0.3 Jaccard, then lexical rerank |
| Recall@1 | **0.286** |
| Recall@3 | **0.714** |
| Recall@5 | **0.929** |
| HitRate@5 | **0.929** |
| MRR | **0.542** |

See `last_run.json`. Re-run with `python -m eval.run_eval` from `backend/`.

Recall@1 is low because the gold set is mostly paraphrases and the default embedder is hashed n-grams. Keyword and factual items recover by @5. This is expected, not a production quality claim.

## Dataset

- `gold.json` — 14 queries: paraphrases, conceptual, keyword, cross-document, factual
- Corpus: 13 short markdown documents in `backend/corpus/`
- Default embedder: **hash-ngram**. Neural SBERT is optional (`NEXUS_EMBEDDING_PROVIDER=sbert`) and was **not available** in the environment that produced the numbers above.

## Hit rule

A hit is a retrieved document ID matching the gold ID (or `altDocumentIds`). `strictPage` is used only for keyword items.

## Limitations

- Tiny corpus and tiny gold set
- Hashing embeddings reward token overlap; paraphrases often miss @1
- Scores will change if you switch embedding providers or rebuild the corpus
