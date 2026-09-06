#!/usr/bin/env python3
"""Measure retrieval metrics on the bundled gold set.

These numbers are local prototype measurements. They are not production SLOs
and do not claim general RAG quality.
"""

from __future__ import annotations

import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from app.rag.pipeline import Pipeline


def hit(h: dict, item: dict) -> bool:
    ids = {item["documentId"], *item.get("altDocumentIds", [])}
    if h["documentId"] not in ids:
        return False
    if item.get("strictPage") and item.get("page") is not None:
        return int(h["page"]) == int(item["page"])
    return True


def metrics_at_k(hits: list[dict], item: dict, k: int) -> tuple[float, float]:
    ranked = hits[:k]
    recall = 0.0
    rr = 0.0
    for i, h in enumerate(ranked, start=1):
        if hit(h, item):
            recall = 1.0
            rr = 1.0 / i
            break
    return recall, rr


def main() -> dict:
    gold_path = Path(__file__).with_name("gold.json")
    gold = json.loads(gold_path.read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory() as tmp:
        pipe = Pipeline(data_dir=Path(tmp))
        pipe.seed_corpus()
        ks = (1, 3, 5)
        rec = {k: 0.0 for k in ks}
        mrr = 0.0
        rows = []
        for item in gold:
            hits = pipe.search(item["query"], mode="hybrid", top_k=5)
            r1, _ = metrics_at_k(hits, item, 1)
            r3, _ = metrics_at_k(hits, item, 3)
            r5, rr5 = metrics_at_k(hits, item, 5)
            rec[1] += r1
            rec[3] += r3
            rec[5] += r5
            mrr += rr5
            rows.append(
                {
                    "kind": item.get("kind", ""),
                    "query": item["query"],
                    "expect": f"{item['documentId']} p.{item['page']}",
                    "got": [f"{h['documentId']} p.{h['page']}" for h in hits[:3]],
                    "recall@1": r1,
                    "recall@3": r3,
                    "recall@5": r5,
                }
            )
        n = len(gold)
        result = {
            "when": datetime.now(timezone.utc).isoformat(),
            "n_queries": n,
            "corpus_documents": len(pipe.store.documents()),
            "chunks": len(pipe.index),
            "embedding": pipe.embedder.name,
            "embedding_dim": pipe.embedder.dim,
            "retrieval": "hybrid (0.7 dense FAISS IP + 0.3 Jaccard) then lexical rerank",
            "top_k": 5,
            "Recall@1": rec[1] / n,
            "Recall@3": rec[3] / n,
            "Recall@5": rec[5] / n,
            "HitRate@5": rec[5] / n,
            "MRR": mrr / n,
            "note": "Local prototype metrics on a tiny designed corpus. Not production SLOs.",
            "rows": rows,
        }
        print("NEXUS local RAG eval (measured)")
        print(f"when={result['when']}")
        print(
            f"n={n} docs={result['corpus_documents']} chunks={result['chunks']} "
            f"embedding={result['embedding']} dim={result['embedding_dim']}"
        )
        print(f"Recall@1 = {result['Recall@1']:.3f}")
        print(f"Recall@3 = {result['Recall@3']:.3f}")
        print(f"Recall@5 = {result['Recall@5']:.3f}")
        print(f"HitRate@5= {result['HitRate@5']:.3f}")
        print(f"MRR      = {result['MRR']:.3f}")
        print(result["note"])
        for row in rows:
            print(
                f"- {row['kind']:<14} R@1={int(row['recall@1'])} "
                f"R@5={int(row['recall@5'])}  {row['expect']}  ← {row['query'][:70]}"
            )
        return result


if __name__ == "__main__":
    main()
