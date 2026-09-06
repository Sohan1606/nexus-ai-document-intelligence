import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_MODE, DEMO_MODE, getHealth, type HealthInfo } from '@/services/api'

export function SettingsView() {
  const [health, setHealth] = useState<HealthInfo | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    void getHealth().then((h) => {
      setHealth(h)
      setChecked(true)
    })
  }, [])

  return (
    <div className="max-w-xl">
      <p className="label-caps">Settings</p>
      <h1 className="mt-2 text-3xl tracking-display">Prototype controls.</h1>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="label-caps">Mode</dt>
          <dd className="mt-2 text-sm text-mist">
            {DEMO_MODE ? 'Demo retrieval' : 'Real local RAG'} ({API_MODE}).{' '}
            {DEMO_MODE
              ? 'Search, upload, and chat run against the in-browser corpus. No backend required.'
              : 'The workspace talks to FastAPI. If the API or Ollama is down, the UI falls back to the demo corpus so it stays usable.'}
          </dd>
        </div>
        <div>
          <dt className="label-caps">FastAPI</dt>
          <dd className="mt-2 text-sm text-mist">
            {!checked
              ? 'Checking…'
              : health
                ? `Reachable · ${health.documents} docs · ${health.chunks} chunks · ${health.embedding} · rerank ${health.rerank}`
                : 'Not reachable on this origin. Demo corpus remains available.'}
          </dd>
        </div>
        <div>
          <dt className="label-caps">Local LLM</dt>
          <dd className="mt-2 text-sm text-mist">
            {health?.llm?.available
              ? `Ollama available (${health.llm.model})`
              : 'Ollama not detected. Answers use extractive reading of retrieved passages — not a generated narrative.'}
          </dd>
        </div>
        <div>
          <dt className="label-caps">API contract</dt>
          <dd className="mt-2 text-sm text-mist">
            UI depends on <code className="text-ice">src/services/api.ts</code>. Demo and local
            share the same functions.
          </dd>
        </div>
        <div>
          <dt className="label-caps">Architecture</dt>
          <dd className="mt-2 text-sm text-mist">
            <Link to="/#how-it-works" className="text-ice hover:underline">
              Open the film’s architecture section
            </Link>
          </dd>
        </div>
        <div>
          <dt className="label-caps">Motion</dt>
          <dd className="mt-2 text-sm text-mist">
            Respects <code>prefers-reduced-motion</code> at the OS level.
          </dd>
        </div>
      </dl>
    </div>
  )
}
