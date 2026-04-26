import type { ICache, IFonts, IHttp } from '@/core/ports'
import { FetchHttpAdapter } from '@/core/http/FetchHttpAdapter'
import { MemoryTtlCache } from '@/core/cache/MemoryTtlCache'
import { NominatimAdapter } from '@/features/location/infrastructure/NominatimAdapter'

class StubFontsAdapter implements IFonts {
  async ensureLoaded(): Promise<void> {
    await document.fonts.ready
  }
}

interface Services {
  http: IHttp
  cache: ICache
  fonts: IFonts
  nominatim: NominatimAdapter
  config: {
    nominatimBaseUrl: string
    tilesBaseUrl: string
  }
}

function buildServices(): Services {
  const config = {
    nominatimBaseUrl:
      import.meta.env.VITE_NOMINATIM_BASE_URL ??
      'https://nominatim.openstreetmap.org',
    tilesBaseUrl:
      import.meta.env.VITE_TILES_BASE_URL ?? 'https://tiles.openfreemap.org',
  }
  const http = new FetchHttpAdapter()
  const cache = new MemoryTtlCache()
  return {
    http,
    cache,
    fonts: new StubFontsAdapter(),
    nominatim: new NominatimAdapter(http, cache, config.nominatimBaseUrl),
    config,
  }
}

export const services: Services = buildServices()
