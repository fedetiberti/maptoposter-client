import { MapCanvas } from '@/features/map/ui/MapCanvas'
import { PosterProvider } from '@/features/poster/application/PosterContext'
import { PosterFrame } from '@/features/poster/ui/PosterFrame'
import { ReverseGeocoderEffect } from '@/features/location/ui/ReverseGeocoderEffect'
import { Dock } from '@/features/dock/ui/Dock'
import { DockProvider } from '@/features/dock/application/DockContext'
import { StatusBar } from '@/features/dock/ui/StatusBar'
import { BrandOverlay } from '@/features/dock/ui/BrandOverlay'
import { ExportFAB } from '@/features/export/ui/ExportFAB'

export default function App() {
  return (
    <PosterProvider>
      <DockProvider>
        <ReverseGeocoderEffect />
        <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
          {/* Subtle grid texture under the map for atelier feel */}
          <div
            className="grid-grain pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
          />
          <MapCanvas />
          <PosterFrame />
          <BrandOverlay />
          <Dock />
          <ExportFAB />
          <StatusBar />
        </main>
      </DockProvider>
    </PosterProvider>
  )
}
