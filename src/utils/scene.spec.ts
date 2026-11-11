import { describe, expect, it } from 'vitest'
import { sceneFromWeather } from './scene'
import type { CurrentWeather } from '@/types/weather'

function weather(id: number): CurrentWeather {
  return {
    dt: 0,
    timezone: 0,
    name: 'Test',
    weather: [{ id, main: '', description: '', icon: '01d' }],
    main: { temp: 0, feels_like: 0, temp_min: 0, temp_max: 0, pressure: 0, humidity: 0 },
    wind: { speed: 0, deg: 0 },
    clouds: { all: 0 },
    sys: { sunrise: 0, sunset: 0 },
  }
}

describe('sceneFromWeather', () => {
  it.each([
    [211, 'storm'],
    [301, 'rain'],
    [502, 'rain'],
    [601, 'snow'],
    [741, 'mist'],
    [800, 'clear'],
    [801, 'partly'],
    [802, 'cloudy'],
    [804, 'overcast'],
  ])('maps weather id %i to %s', (id, condition) => {
    expect(sceneFromWeather(weather(id))).toBe(condition)
  })
})
