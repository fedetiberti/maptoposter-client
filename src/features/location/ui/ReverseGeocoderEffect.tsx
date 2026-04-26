import { useReverseGeocoder } from '@/features/location/application/useReverseGeocoder'

/** Component-as-effect-host: lets us run the hook inside <PosterProvider>. */
export function ReverseGeocoderEffect() {
  useReverseGeocoder()
  return null
}
