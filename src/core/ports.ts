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
  /** family is the FontDef id; weight is one of the family's declared weights. */
  ensureLoaded(family: string, weight: number): Promise<void>
}
