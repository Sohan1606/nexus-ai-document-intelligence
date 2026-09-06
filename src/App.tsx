import { lazy, Suspense, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import { CustomCursor } from '@/components/layout/CustomCursor'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { NoiseOverlay } from '@/components/ui/NoiseOverlay'
import { CommandPaletteContext } from '@/hooks/useCommandPalette'

const Workspace = lazy(() => import('@/pages/Workspace'))

export default function App() {
  const [open, setOpen] = useState(false)
  const palette = useMemo(() => ({ open, setOpen }), [open])

  return (
    <CommandPaletteContext.Provider value={palette}>
      <BrowserRouter>
        <NoiseOverlay />
        <CustomCursor />
        <CommandPalette />
        <Suspense fallback={<Boot />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CommandPaletteContext.Provider>
  )
}

function Boot() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-void">
      <p className="tracking-[0.28em] text-mist">NEXUS</p>
    </div>
  )
}
