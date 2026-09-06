from app.rag.chunking import PageText, chunk_pages, parse_marked_text


def test_parse_page_markers():
    raw = """<!-- page: 1 section: Intro -->
Hello world.

<!-- page: 2 section: Body -->
Second page lives here.
"""
    pages = parse_marked_text(raw)
    assert [p.page for p in pages] == [1, 2]
    assert pages[0].section == "Intro"
    assert "Second" in pages[1].text


def test_chunks_never_mix_pages():
    pages = [
        PageText(page=1, section="A", text=("alpha " * 80).strip()),
        PageText(page=2, section="B", text=("beta " * 80).strip()),
    ]
    chunks = chunk_pages("doc", pages, size=90, overlap=20)
    assert chunks
    assert all(c.page in {1, 2} for c in chunks)
    for c in chunks:
        if c.page == 1:
            assert "beta" not in c.text
            assert "alpha" in c.text
        if c.page == 2:
            assert "alpha" not in c.text
            assert "beta" in c.text


def test_small_page_is_single_chunk():
    pages = [PageText(page=3, section="S", text="short passage")]
    chunks = chunk_pages("x", pages, size=700, overlap=120)
    assert len(chunks) == 1
    assert chunks[0].page == 3
