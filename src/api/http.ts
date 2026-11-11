export type ApiErrorCode =
  'network' | 'unauthorized' | 'notFound' | 'rateLimit' | 'server' | 'missingKey'

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode) {
    super(code)
    this.name = 'ApiError'
    this.code = code
  }
}

interface RequestOptions {
  signal?: AbortSignal
  ttl?: number
  force?: boolean
}

interface CacheEntry {
  expires: number
  data: unknown
}

const cache = new Map<string, CacheEntry>()

export function isAbortError(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === 'AbortError'
}

export function toErrorCode(error: unknown): ApiErrorCode {
  return error instanceof ApiError ? error.code : 'network'
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized'
  if (status === 404) return 'notFound'
  if (status === 429) return 'rateLimit'
  return 'server'
}

export function buildUrl(base: string, params: Record<string, string | number>): string {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  return url.toString()
}

export async function getJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { signal, ttl = 0, force = false } = options
  const cached = cache.get(url)

  if (!force && cached && cached.expires > Date.now()) {
    return cached.data as T
  }

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError('network')
  }

  if (!response.ok) {
    throw new ApiError(codeFromStatus(response.status))
  }

  const data = (await response.json()) as T
  if (ttl > 0) {
    cache.set(url, { expires: Date.now() + ttl, data })
  }
  return data
}
