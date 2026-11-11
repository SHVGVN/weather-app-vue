import type { City } from '@/types/weather'

export function readStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isCity(value: unknown): value is City {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.country === 'string' &&
    typeof value.lat === 'number' &&
    typeof value.lon === 'number' &&
    isRecord(value.localNames)
  )
}

export function isCityList(value: unknown): value is City[] {
  return Array.isArray(value) && value.every(isCity)
}
