import type { CurrentWeather, DaySummary, Forecast, ForecastItem, HourPoint } from '@/types/weather'

const MIN_TODAY_POINTS = 3
const NEXT_DAY_POINTS = 8
const MIDDAY_HOUR = 13

export function toCityDate(dt: number, timezone: number): Date {
  return new Date((dt + timezone) * 1000)
}

export function dateKey(dt: number, timezone: number): string {
  return toCityDate(dt, timezone).toISOString().slice(0, 10)
}

function cityHour(dt: number, timezone: number): number {
  return toCityDate(dt, timezone).getUTCHours()
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export interface TodayHours {
  points: HourPoint[]
  spansNextDay: boolean
}

export function getTodayHours(current: CurrentWeather, forecast: Forecast): TodayHours {
  const timezone = forecast.city.timezone
  const today = dateKey(current.dt, timezone)
  const upcoming = forecast.list.filter((item) => item.dt > current.dt)
  const todayItems = upcoming.filter((item) => dateKey(item.dt, timezone) === today)
  const spansNextDay = todayItems.length < MIN_TODAY_POINTS
  const items = spansNextDay ? upcoming.slice(0, NEXT_DAY_POINTS) : todayItems

  return {
    points: [
      { dt: current.dt, temp: current.main.temp },
      ...items.map((item) => ({ dt: item.dt, temp: item.main.temp })),
    ],
    spansNextDay,
  }
}

function pickRepresentative(items: ForecastItem[], timezone: number): ForecastItem {
  return items.reduce((best, item) => {
    const distance = Math.abs(cityHour(item.dt, timezone) - MIDDAY_HOUR)
    const bestDistance = Math.abs(cityHour(best.dt, timezone) - MIDDAY_HOUR)
    return distance < bestDistance ? item : best
  })
}

export function groupByDay(forecast: Forecast): Map<string, ForecastItem[]> {
  const timezone = forecast.city.timezone
  return forecast.list.reduce((groups, item) => {
    const key = dateKey(item.dt, timezone)
    const group = groups.get(key)
    if (group) {
      group.push(item)
    } else {
      groups.set(key, [item])
    }
    return groups
  }, new Map<string, ForecastItem[]>())
}

export function getDailySummaries(forecast: Forecast, days = 5): DaySummary[] {
  const timezone = forecast.city.timezone

  return [...groupByDay(forecast).entries()].slice(0, days).map(([date, items]) => {
    const representative = pickRepresentative(items, timezone)
    const condition = representative.weather[0]

    return {
      date,
      dt: representative.dt,
      avg: average(items.map((item) => item.main.temp)),
      min: Math.min(...items.map((item) => item.main.temp_min)),
      max: Math.max(...items.map((item) => item.main.temp_max)),
      humidity: Math.round(average(items.map((item) => item.main.humidity))),
      wind: Math.max(...items.map((item) => item.wind.speed)),
      pop: Math.max(...items.map((item) => item.pop ?? 0)),
      icon: (condition?.icon ?? '03d').replace('n', 'd'),
      description: condition?.description ?? '',
    }
  })
}
