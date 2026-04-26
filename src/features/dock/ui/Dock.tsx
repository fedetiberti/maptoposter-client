import { DockRail } from '@/features/dock/ui/DockRail'
import { DockPanel } from '@/features/dock/ui/DockPanel'
import { LocationPanel } from '@/features/location/ui/LocationPanel'
import { LayoutPicker } from '@/features/layout/ui/LayoutPicker'
import { ThemePicker } from '@/features/theme/ui/ThemePicker'
import { OverridePanel } from '@/features/theme/ui/OverridePanel'
import { LayerTogglesPanel } from '@/features/map/ui/LayerTogglesPanel'
import { FontPicker } from '@/features/typography/ui/FontPicker'
import { MarkerEditor } from '@/features/markers/ui/MarkerEditor'
import { GpxImportButton } from '@/features/gpx/ui/GpxImportButton'
import { ExportPanel } from '@/features/export/ui/ExportPanel'
import { TitleControlPanel } from '@/features/poster/ui/TitleControlPanel'

export function Dock() {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-30 flex items-start">
      <DockPanel id="location">
        <LocationPanel />
        <div className="hairline my-3" />
        <TitleControlPanel />
      </DockPanel>
      <DockPanel id="layout">
        <LayoutPicker />
      </DockPanel>
      <DockPanel id="theme">
        <ThemePicker />
      </DockPanel>
      <DockPanel id="overrides">
        <OverridePanel />
      </DockPanel>
      <DockPanel id="typography">
        <FontPicker />
      </DockPanel>
      <DockPanel id="markers">
        <MarkerEditor />
      </DockPanel>
      <DockPanel id="gpx">
        <GpxImportButton />
      </DockPanel>
      <DockPanel id="layers">
        <LayerTogglesPanel />
      </DockPanel>
      <DockPanel id="export">
        <ExportPanel />
      </DockPanel>
      <DockRail />
    </div>
  )
}
