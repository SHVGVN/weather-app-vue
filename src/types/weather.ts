export type Locale = 'en' | 'uk'
export type Units = 'metric' | 'imperial'
export type Theme = 'day' | 'night'
export type ViewMode = 'day' | 'week'

export interface City {
  id: string
  name: string
  localNames: Partial<Record<Locale, string>>
  country: string
  state?: string
  lat: number
  lon: number
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface MainMetrics {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export interface Wind {
  speed: number
  deg: number
}

export interface CurrentWeather {
  dt: number
  timezone: number
  name: string
  weather: WeatherCondition[]
  main: MainMetrics
  wind: Wind
  clouds: { all: number }
  visibility?: number
  sys: { country?: string; sunrise: number; sunset: number }
}

export interface ForecastItem {
  dt: number
  main: MainMetrics
  weather: WeatherCondition[]
  wind: Wind
  pop: number
}

export interface Forecast {
  list: ForecastItem[]
  city: {
    id: number
    name: string
    country: string
    timezone: number
    sunrise: number
    sunset: number
  }
}

export interface GeoResult {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}

export interface HourPoint {
  dt: number
  temp: number
}

export interface DaySummary {
  date: string
  dt: number
  avg: number
  min: number
  max: number
  humidity: number
  wind: number
  pop: number
  icon: string
  description: string
}
