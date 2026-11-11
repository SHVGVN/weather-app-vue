import { describe, expect, it } from 'vitest'
import { dateKey, getDailySummaries, getTodayHours } from './forecast'
import type { CurrentWeather, Forecast, ForecastItem } from '@/types/weather'

const HOUR = 3600
const START = Date.UTC(2026, 10, 11, 0, 0, 0) / 1000

function item(dt: number, temp: number, icon = '01d'): ForecastItem {
  return {
    dt,
    main: {
      temp,
      feels_like: temp,
      temp_min: temp - 1,
      temp_max: temp + 1,
      pressure: 1010,
      humidity: 50,
    },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon }],
    wind: { speed: 3, deg: 90 },
    pop: 0.2,
  }
}

function forecast(timezone: number, temps: number[]): Forecast {
  return {
    list: temps.map((temp, index) => item(START + index * 3 * HOUR, temp)),
    city: { id: 1, name: 'Test', country: 'UA', timezone, sunrise: 0, sunset: 0 },
  }
}

function current(dt: number, temp: number): CurrentWeather {
  return {
    dt,
    timezone: 0,
    name: 'Test',
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    main: { temp, feels_like: temp, temp_min: temp, temp_max: temp, pressure: 1010, humidity: 50 },
    wind: { speed: 3, deg: 90 },
    clouds: { all: 0 },
    sys: { sunrise: 0, sunset: 0 },
  }
}

describe('dateKey', () => {
  it('uses the city timezone instead of the browser timezone', () => {
    const lateEvening = Date.UTC(2026, 10, 11, 22, 0, 0) / 1000
    expect(dateKey(lateEvening, 0)).toBe('2026-11-11')
    expect(dateKey(lateEvening, 3 * HOUR)).toBe('2026-11-12')
  })
})

describe('getDailySummaries', () => {
  it('averages hourly temperatures per day', () => {
    const temps = [...Array(8).fill(10), ...Array(8).fill(20), ...Array(8).fill(4)]
    const days = getDailySummaries(forecast(0, temps))

    expect(days).toHaveLength(3)
    expect(days.map((day) => day.avg)).toEqual([10, 20, 4])
    expect(days[0]?.min).toBe(9)
    expect(days[0]?.max).toBe(11)
  })

  it('limits the result to the requested amount of days', () => {
    const temps = Array(48).fill(0)
    expect(getDailySummaries(forecast(0, temps), 5)).toHaveLength(5)
  })

  it('always returns a day icon', () => {
    const data = forecast(0, [1, 2, 3])
    data.list.forEach((entry) => (entry.weather[0]!.icon = '01n'))
    expect(getDailySummaries(data)[0]?.icon).toBe('01d')
  })
})

describe('getTodayHours', () => {
  it('starts with the current temperature and keeps only today points', () => {
    const data = forecast(0, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const result = getTodayHours(current(START + HOUR, 0), data)

    expect(result.spansNextDay).toBe(false)
    expect(result.points[0]?.temp).toBe(0)
    expect(result.points.map((point) => point.temp)).toEqual([0, 2, 3, 4, 5, 6, 7, 8])
  })

  it('falls back to the next 24 hours late in the evening', () => {
    const data = forecast(
      0,
      Array.from({ length: 16 }, (_, index) => index),
    )
    const result = getTodayHours(current(START + 22 * HOUR, 0), data)

    expect(result.spansNextDay).toBe(true)
    expect(result.points).toHaveLength(9)
  })
})
