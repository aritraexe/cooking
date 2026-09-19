import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'
import { ToolCard } from '@/components/ToolCard'
import { getActiveToolsFor, tools } from '@/data/tools'
import type { ToolFamily, ToolMeta } from '@/types'

const VALUE_PROPS = [
  {
    title: '100% in your browser',
    body: 'Every file is processed on your device. Nothing is ever uploaded.',
  },
  {
    title: 'No ads, ever',
    body: 'Just the tools you came for — no banners, no tracking, no clutter.',
  },
  {
    title: 'Free, no account needed',
    body: 'Open a tool and start. No sign-up, no paywall.',
  },
]

function detectFamily(file: File): ToolFamily | null {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  return null
}

export function Home() {
  const navigate = useNavigate()
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [choices, setChoices] = useState<ToolMeta[] | null>(null)

  const handleHeroFile = useCallback(
    (file: File) => {
      const family = detectFamily(file)
      const applicable = family ? getActiveToolsFor(family) : []

      if (applicable.length === 1) {
        navigate(`/tools/${applicable[0].path}`, { state: { file } })
        return
      }

      setHeroFile(file)
      setChoices(applicable)
    },
    [navigate],
  )

  const imageTools = tools.filter((t) => t.family === 'image')
  const pdfTools = tools.filter((t) => t.family === 'pdf')

  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <h1 className="ff-hero-title text-balance text-4xl sm:text-5xl">
          Every PDF and image tool, in one place.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-ink-muted">
          Compress, resize, convert, and more — all of it runs right here in your browser.
          Nothing you drop below is ever uploaded.
        </p>

        <div className="mt-10">
          <FileDropzone
            accept="image/*,application/pdf"
            hint="Any PDF or image file"
            onFile={handleHeroFile}
          />
        </div>

        {heroFile && choices && choices.length > 0 && (
          <div className="ff-card mt-4 rounded-xl border p-4 text-left">
            <p className="text-sm text-ink-muted">
              What would you like to do with <span className="text-ink">{heroFile.name}</span>?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {choices.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => navigate(`/tools/${tool.path}`, { state: { file: heroFile } })}
                  className="ff-control rounded-lg border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {heroFile && choices && choices.length === 0 && (
          <div className="ff-card mt-4 rounded-xl border p-4 text-left text-sm text-ink-muted">
            Tools for that file type are still on the way — see what's live below.
          </div>
        )}

        <dl className="mt-16 grid gap-8 text-left sm:grid-cols-3 sm:gap-6">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="border-t border-line pt-4">
              <dt className="font-display text-sm font-medium text-ink">{item.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="all-tools" className="mx-auto max-w-5xl scroll-mt-8 px-6 pb-24">
        <h2 className="font-display text-xl font-semibold text-ink">Image tools</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imageTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        <h2 className="mt-14 font-display text-xl font-semibold text-ink">PDF tools</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pdfTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  )
}
