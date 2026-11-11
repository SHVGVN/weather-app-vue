import type { CurrentWeather } from '@/types/weather'

export type SceneCondition =
  'clear' | 'partly' | 'cloudy' | 'overcast' | 'rain' | 'storm' | 'snow' | 'mist'

export function sceneFromWeather(weather: CurrentWeather): SceneCondition {
  const id = weather.weather[0]?.id ?? 801

  if (id >= 200 && id < 300) return 'storm'
  if (id >= 300 && id < 600) return 'rain'
  if (id >= 600 && id < 700) return 'snow'
  if (id >= 700 && id < 800) return 'mist'
  if (id === 800) return 'clear'
  if (id === 801) return 'partly'
  if (id === 802) return 'cloudy'
  return 'overcast'
}
