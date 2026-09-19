export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="group font-display text-sm font-medium text-ink">
          <span>
            FluxForge
          </span>{' '}
          <span
            aria-hidden="true"
            className="inline-block transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] group-hover:rotate-[540deg] group-hover:scale-150 group-hover:text-ink-muted group-hover:drop-shadow-[0_0_6px_currentColor] group-hover:drop-shadow-[0_0_14px_currentColor]"
          >
            ·
          </span>{' '}
          <a
            href="https://www.x3non.xyz"
            target="_blank"
            rel="noreferrer"
            aria-label="Crafted By Xenon (opens in a new tab)"
            title="Opens in a new tab"
            className="relative inline-block underline decoration-current underline-offset-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:rotate-1 hover:skew-x-[-8deg] hover:scale-105 hover:text-ink-muted hover:tracking-[0.04em] hover:decoration-2 hover:opacity-70 hover:drop-shadow-[0_0_8px_currentColor] hover:drop-shadow-[3px_3px_0_currentColor] active:translate-y-0 active:scale-95"
          >
            Crafted By Xenon{' '}
            <span aria-hidden="true" className="inline-block transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </p>
        <p className="mt-1.5 max-w-md text-sm text-ink-muted">
          Every file is processed on your device and never uploaded. No accounts, no ads, no
          tracking.
        </p>
      </div>
    </footer>
  )
}
