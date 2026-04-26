import { MapCanvas } from '@/features/map/ui/MapCanvas'
import { PosterProvider } from '@/features/poster/application/PosterContext'
import { ViewStatusBar } from '@/features/map/ui/ViewStatusBar'
import { ThemePicker } from '@/features/theme/ui/ThemePicker'
import { OverridePanel } from '@/features/theme/ui/OverridePanel'
import { LocationPanel } from '@/features/location/ui/LocationPanel'
import { LayerTogglesPanel } from '@/features/map/ui/LayerTogglesPanel'
import { ReverseGeocoderEffect } from '@/features/location/ui/ReverseGeocoderEffect'
import { LayoutPicker } from '@/features/layout/ui/LayoutPicker'
import { TitleControlPanel } from '@/features/poster/ui/TitleControlPanel'
import { PosterFrame } from '@/features/poster/ui/PosterFrame'

export default function App() {
  return (
    <PosterProvider>
      <ReverseGeocoderEffect />
      <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
        <MapCanvas />
        <PosterFrame />
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
          <div className="pointer-events-auto rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-md">
            maptoposter · phase 4
          </div>
        </header>

        <aside className="pointer-events-auto absolute right-3 top-3 z-30 flex max-h-[calc(100vh-120px)] w-[360px] flex-col gap-4 overflow-y-auto rounded-xl border border-border/60 bg-card/70 p-4 shadow-2xl backdrop-blur-2xl">
          <LocationPanel />
          <hr className="border-border/30" />
          <LayoutPicker />
          <hr className="border-border/30" />
          <TitleControlPanel />
          <hr className="border-border/30" />
          <LayerTogglesPanel />
          <hr className="border-border/30" />
          <ThemePicker />
          <hr className="border-border/30" />
          <OverridePanel />
        </aside>

        <ViewStatusBar />
      </main>
    </PosterProvider>
  )
}
