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
  ensureLoaded(family: string, weight: number): Promise<void>
}
