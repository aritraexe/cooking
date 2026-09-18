interface CornerBracketsProps {
  active?: boolean
}

// Four L-shaped marks, like the crop/registration marks on a print proof.
// Purely decorative on their own, but the color shift on `active` doubles
// as the drag-over state for the dropzone that wraps this.
export function CornerBrackets({ active = false }: CornerBracketsProps) {
  const color = active ? 'stroke-accent' : 'stroke-ink-muted/40'
  const common = `absolute h-5 w-5 transition-colors duration-150 ${color}`

  return (
    <>
      <svg viewBox="0 0 20 20" fill="none" className={`${common} left-4 top-4`}>
        <path d="M1 8V1H8" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 20 20" fill="none" className={`${common} right-4 top-4`}>
        <path d="M12 1h7v7" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 20 20" fill="none" className={`${common} bottom-4 left-4`}>
        <path d="M1 12v7h7" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 20 20" fill="none" className={`${common} bottom-4 right-4`}>
        <path d="M19 12v7h-7" strokeWidth="1.5" />
      </svg>
    </>
  )
}
