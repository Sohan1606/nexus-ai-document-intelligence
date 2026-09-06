export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-overlay"
    >
      <div className="noise-bg absolute -inset-[20%] animate-[grain-shift_1.2s_steps(2)_infinite]" />
    </div>
  )
}
