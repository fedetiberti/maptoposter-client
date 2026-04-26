import { MapCanvas } from '@/features/map/ui/MapCanvas'
import { PosterProvider } from '@/features/poster/application/PosterContext'
import { ViewStatusBar } from '@/features/map/ui/ViewStatusBar'
import { ThemePicker } from '@/features/theme/ui/ThemePicker'
import { OverridePanel } from '@/features/theme/ui/OverridePanel'

export default function App() {
  return (
    <PosterProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
        <MapCanvas />
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
          <div className="pointer-events-auto rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-md">
            maptoposter · phase 2
          </div>
        </header>

        {/* Right-edge dock — temporary always-open panel until phase 10 polish */}
        <aside className="pointer-events-auto absolute right-3 top-3 z-30 flex max-h-[calc(100vh-120px)] w-[360px] flex-col gap-4 overflow-y-auto rounded-xl border border-border/60 bg-card/70 p-4 shadow-2xl backdrop-blur-2xl">
          <ThemePicker />
          <hr className="border-border/30" />
          <OverridePanel />
        </aside>

        <ViewStatusBar />
      </main>
    </PosterProvider>
  )
}
