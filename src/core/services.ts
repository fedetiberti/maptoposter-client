import type { ICache, IFonts, IHttp } from '@/core/ports'
import { FetchHttpAdapter } from '@/core/http/FetchHttpAdapter'
import { MemoryTtlCache } from '@/core/cache/MemoryTtlCache'

class StubFontsAdapter implements IFonts {
  async ensureLoaded(): Promise<void> {
    await document.fonts.ready
  }
}

interface Services {
  http: IHttp
  cache: ICache
  fonts: IFonts
  config: {
    nominatimBaseUrl: string
    tilesBaseUrl: string
  }
}

function buildServices(): Services {
  return {
    http: new FetchHttpAdapter(),
    cache: new MemoryTtlCache(),
    fonts: new StubFontsAdapter(),
    config: {
      nominatimBaseUrl:
        import.meta.env.VITE_NOMINATIM_BASE_URL ??
        'https://nominatim.openstreetmap.org',
      tilesBaseUrl:
        import.meta.env.VITE_TILES_BASE_URL ?? 'https://tiles.openfreemap.org',
    },
  }
}

export const services: Services = buildServices()
