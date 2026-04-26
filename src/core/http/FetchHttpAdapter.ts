import type { IHttp } from '@/core/ports'

export class FetchHttpAdapter implements IHttp {
  async get<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      return (await res.json()) as T
    }
    return (await res.text()) as unknown as T
  }
}
