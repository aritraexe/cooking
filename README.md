# FluxForge

Every PDF and image tool in one place — compressed, resized, converted, and
edited entirely in the browser. Nothing you drop into it is ever uploaded
anywhere; there's no server in this app at all.

## What's actually built right now

- **Compress Image** — quality slider, WebP/JPEG/PNG output, live before/after size
- **Resize Image** — exact pixel dimensions, aspect-ratio lock, quick presets

Everything else in the homepage grid (Merge PDF, Remove Background, etc.) is
listed but marked "Soon" — they're in the registry as a roadmap, not built yet.
See "Adding a new tool" below for how to turn one on.

## Quick start

```bash
npm install
npm run dev       # starts a local dev server, usually http://localhost:5173
npm run build     # type-checks and produces a static build in dist/
npm run preview   # serves that dist/ build locally, for a final check
```

There is no backend, no `.env` file, and nothing to configure. `npm run build`
produces a fully static `dist/` folder — drag it onto Vercel, Netlify, or
Cloudflare Pages (or any static host) and it's live. Hosting cost stays
effectively zero regardless of traffic, since there's no server-side compute.

## How it works

Every tool follows the same shape: drop a file → hand it to a **Web Worker** →
the worker decodes it and draws it to an `OffscreenCanvas` → re-encodes and
sends a `Blob` back → you get a download link. None of that touches a server,
and none of it blocks the page, because it all happens off the main thread.

```
src/
├── workers/imageTransform.worker.ts   the shared resize/compress engine
├── hooks/useImageTransform.ts         React hook wrapping that worker
├── components/                        shared UI: dropzone, cards, layout
├── data/tools.ts                      the registry — every tool, built or planned
├── pages/Home.tsx                     hero + tool grid, built from the registry
└── tools/
    ├── compress-image/
    └── resize-image/
```

`compress-image` and `resize-image` both call the *same* worker with
different parameters — that's deliberate. Most new image tools (crop, format
conversion) can reuse it too; genuinely different tools (PDF page merging,
background removal) will want their own worker next to the existing one.

## Adding a new tool

1. Add an entry to `src/data/tools.ts` with `status: 'active'` and a `path`.
2. Create `src/tools/<your-tool>/<YourTool>Page.tsx`. Copy `ResizeImagePage.tsx`
   as a starting point if it's an image tool — the dropzone, preview, and
   result-card pattern all carry over.
3. Register the route in `src/App.tsx`.

That's it — the tool automatically appears on the homepage and becomes a
target for the hero dropzone's "what do you want to do with this file?" picker.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router. No UI kit —
the look (dark, teal accent, corner-bracket "registration mark" motif) is
custom; adjust the tokens at the top of `src/index.css` to change it globally.

## Known gaps worth knowing about before you build on this

- **Office conversions** (Word/Excel/PowerPoint ↔ PDF) don't have a good
  client-side answer — no solid WASM library handles those formats with real
  fidelity. That's the one place a small server function is probably worth it
  eventually.
- **PDF tools** aren't wired up yet. `@cantoo/pdf-lib` (page organizing,
  merge/split) and `pdf.js` (rendering/thumbnails) are the recommended
  libraries — see the roadmap discussion this project came out of. The
  original `pdf-lib` package is unmaintained; use the `@cantoo` fork.
- If you add AI background removal via `@imgly/background-removal`, note it's
  AGPL-licensed — read the terms (or IMG.LY's commercial license) before
  shipping it in anything you monetize.
- Very large files (huge photos, 100+ page PDFs) can still hit real memory
  limits in a browser tab, especially on phones. Worth a soft file-size
  warning before this goes fully public.
