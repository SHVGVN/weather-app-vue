import { getJson, isAbortError } from './http'
import { cityId, searchCities } from './openWeather'
import type { City } from '@/types/weather'

interface IpLocation {
  lat: number
  lon: number
  city: string
  country: string
}

type Provider = (signal?: AbortSignal) => Promise<IpLocation>

export const DEFAULT_CITY: City = {
  id: cityId(50.4501, 30.5234),
  name: 'Kyiv',
  localNames: { en: 'Kyiv', uk: 'Київ' },
  country: 'UA',
  lat: 50.4501,
  lon: 30.5234,
}

function assertLocation(location: IpLocation): IpLocation {
  if (!location.city || Number.isNaN(location.lat) || Number.isNaN(location.lon)) {
    throw new Error('Location is not available')
  }
  return location
}

const fromIpWho: Provider = async (signal) => {
  const data = await getJson<{
    success: boolean
    latitude: number
    longitude: number
    city: string
    country_code: string
  }>('https://ipwho.is/', { signal })
  if (!data.success) throw new Error('Location is not available')
  return assertLocation({
    lat: data.latitude,
    lon: data.longitude,
    city: data.city,
    country: data.country_code,
  })
}

const fromGeoJs: Provider = async (signal) => {
  const data = await getJson<{
    latitude: string
    longitude: string
    city: string
    country_code: string
  }>('https://get.geojs.io/v1/ip/geo.json', { signal })
  return assertLocation({
    lat: Number(data.latitude),
    lon: Number(data.longitude),
    city: data.city,
    country: data.country_code,
  })
}

const fromIpApi: Provider = async (signal) => {
  const data = await getJson<{
    latitude: number
    longitude: number
    city: string
    country_code: string
  }>('https://ipapi.co/json/', { signal })
  return assertLocation({
    lat: data.latitude,
    lon: data.longitude,
    city: data.city,
    country: data.country_code,
  })
}

const providers: Provider[] = [fromIpWho, fromGeoJs, fromIpApi]

async function detectLocation(signal?: AbortSignal): Promise<IpLocation | null> {
  for (const provider of providers) {
    try {
      return await provider(signal)
    } catch (error) {
      if (isAbortError(error)) throw error
    }
  }
  return null
}

export async function resolveUserCity(signal?: AbortSignal): Promise<City> {
  const location = await detectLocation(signal)
  if (!location) return DEFAULT_CITY

  try {
    const [city] = await searchCities(`${location.city},${location.country}`, signal)
    if (city) return city
  } catch (error) {
    if (isAbortError(error)) throw error
  }

  return {
    id: cityId(location.lat, location.lon),
    name: location.city,
    localNames: {},
    country: location.country,
    lat: location.lat,
    lon: location.lon,
  }
}
