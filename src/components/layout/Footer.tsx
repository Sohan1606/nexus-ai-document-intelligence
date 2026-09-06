import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

const cols = [
  {
    title: 'Product',
    links: [
      { href: '#product', label: 'Product' },
      { href: '#intelligence', label: 'Intelligence' },
      { href: '#demo', label: 'Demo' },
    ],
  },
  {
    title: 'Architecture',
    links: [
      { href: '#how-it-works', label: 'How it works' },
      { href: '#security', label: 'Security' },
    ],
  },
  {
    title: 'Open Source',
    links: [
      {
        href: 'https://github.com/mayooear/ai-pdf-chatbot-langchain',
        label: 'GitHub',
        external: true,
      },
      { href: '/workspace', label: 'Documentation' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-mist">
            AI document intelligence. Your documents, searchable by thought.
          </p>
          <p className="mt-6 max-w-sm text-xs leading-relaxed text-fog">
            The GitHub link is conceptual inspiration — a LangChain PDF chatbot
            reference — not a claim that this showcase is that repository.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="lg:col-span-2">
            <p className="label-caps">{c.title}</p>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  {'external' in l && l.external ? (
                    <a
                      href={l.href}
                      data-cursor="hover"
                      className="text-sm text-mist hover:text-snow"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.label}
                    </a>
                  ) : l.href.startsWith('/') ? (
                    <Link
                      to={l.href}
                      data-cursor="hover"
                      className="text-sm text-mist hover:text-snow"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      data-cursor="hover"
                      className="text-sm text-mist hover:text-snow"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <CinematicClose />
    </footer>
  )
}

function CinematicClose() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(154,230,240,0.07),transparent_55%)]" />
      <p className="text-[clamp(3rem,14vw,10rem)] font-medium tracking-[0.22em] text-snow">
        NEXUS
      </p>
      <p className="mt-6 font-display text-xl text-mist italic sm:text-2xl">
        Knowledge, indexed.
      </p>
      <p className="mt-16 text-[11px] tracking-[0.18em] text-fog uppercase">
        Local demonstration · 2026
      </p>
    </div>
  )
}
