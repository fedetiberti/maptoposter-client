export interface IHttp {
  get<T>(url: string, init?: RequestInit): Promise<T>
}

export interface ICache {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs?: number): void
  delete(key: string): void
  clear(): void
}

export interface IFonts {
  /**
   * Resolve once the font is paint-ready. `fontId` is a FontDef id; `weights`
   * defaults to every weight the family declares.
   */
  ensureLoaded(fontId: string, weights?: readonly number[]): Promise<void>
}
