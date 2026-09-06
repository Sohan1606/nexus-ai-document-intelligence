import numpy as np

from app.rag.embeddings import HashingEmbedder


def test_hash_embedder_is_deterministic():
    e = HashingEmbedder(384)
    a = e.embed_text("reserved instance coverage 61%")
    b = e.embed_text("reserved instance coverage 61%")
    assert a.shape == (384,)
    assert np.allclose(a, b)


def test_similar_phrases_outrank_unrelated():
    e = HashingEmbedder(384)
    q = e.embed_text("autoscaling lag saturation window")
    near = e.embed_text("autoscaling lag during the August traffic spike created a saturation window")
    far = e.embed_text("passkeys are preferred over passwords for operators")
    sim_near = float(near @ q)
    sim_far = float(far @ q)
    assert sim_near > sim_far
