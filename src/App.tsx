import { MapCanvas } from '@/features/map/ui/MapCanvas'
import { PosterProvider } from '@/features/poster/application/PosterContext'
import { ViewStatusBar } from '@/features/map/ui/ViewStatusBar'

export default function App() {
  return (
    <PosterProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
        <MapCanvas />
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
          <div className="pointer-events-auto rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-md">
            maptoposter · phase 1
          </div>
        </header>
        <ViewStatusBar />
      </main>
    </PosterProvider>
  )
}
