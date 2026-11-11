import { ApiError, buildUrl, getJson } from './http'
import type { City, CurrentWeather, Forecast, GeoResult, Locale } from '@/types/weather'

const API_ROOT = 'https://api.openweathermap.org'
const API_KEY = import.meta.env.VITE_OWM_KEY
const WEATHER_TTL = 10 * 60 * 1000
const GEO_TTL = 24 * 60 * 60 * 1000

interface FetchOptions {
  signal?: AbortSignal
  force?: boolean
}

function apiUrl(path: string, params: Record<string, string | number>): string {
  if (!API_KEY) throw new ApiError('missingKey')
  return buildUrl(`${API_ROOT}${path}`, { ...params, appid: API_KEY })
}

export function cityId(lat: number, lon: number): string {
  return `${lat.toFixed(3)}:${lon.toFixed(3)}`
}

export function toCity(result: GeoResult): City {
  const localNames: City['localNames'] = {}
  if (result.local_names?.en) localNames.en = result.local_names.en
  if (result.local_names?.uk) localNames.uk = result.local_names.uk

  return {
    id: cityId(result.lat, result.lon),
    name: result.name,
    localNames,
    country: result.country,
    state: result.state,
    lat: result.lat,
    lon: result.lon,
  }
}

function uniqueCities(results: GeoResult[]): City[] {
  const seen = new Set<string>()
  return results.reduce<City[]>((cities, result) => {
    const key = `${result.name}|${result.state ?? ''}|${result.country}`
    if (!seen.has(key)) {
      seen.add(key)
      cities.push(toCity(result))
    }
    return cities
  }, [])
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const results = await getJson<GeoResult[]>(apiUrl('/geo/1.0/direct', { q: query, limit: 5 }), {
    signal,
    ttl: GEO_TTL,
  })
  return uniqueCities(results)
}

export function fetchCurrentWeather(
  city: City,
  lang: Locale,
  options: FetchOptions = {},
): Promise<CurrentWeather> {
  const url = apiUrl('/data/2.5/weather', { lat: city.lat, lon: city.lon, units: 'metric', lang })
  return getJson<CurrentWeather>(url, { ...options, ttl: WEATHER_TTL })
}

export function fetchForecast(
  city: City,
  lang: Locale,
  options: FetchOptions = {},
): Promise<Forecast> {
  const url = apiUrl('/data/2.5/forecast', { lat: city.lat, lon: city.lon, units: 'metric', lang })
  return getJson<Forecast>(url, { ...options, ttl: WEATHER_TTL })
}
