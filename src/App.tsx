import { cn } from '@/lib/utils'

export default function App() {
  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 50% 20%, oklch(0.28 0 0 / 0.6), transparent 70%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <span
          className={cn(
            'rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs',
            'font-medium tracking-wide text-muted-foreground backdrop-blur-md',
          )}
        >
          maptoposter-client · phase 0
        </span>
        <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
          Print-grade map posters,
          <br className="hidden md:block" /> rendered in your browser.
        </h1>
        <p className="max-w-xl text-balance text-base text-muted-foreground md:text-lg">
          A1 at 400 DPI. 35 themes. Every layer customizable. No backend.
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground/70">
          <span className="size-1.5 rounded-full bg-emerald-400/80" />
          Scaffold ready · live map preview lands next
        </div>
      </div>
    </main>
  )
}
