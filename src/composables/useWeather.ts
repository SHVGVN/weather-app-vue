import { onBeforeUnmount, ref, shallowRef, watch, type Ref } from 'vue'
import { fetchCurrentWeather, fetchForecast } from '@/api/openWeather'
import { isAbortError, toErrorCode, type ApiErrorCode } from '@/api/http'
import { useSettingsStore } from '@/stores/settings'
import type { City, CurrentWeather, Forecast } from '@/types/weather'

export function useWeather(city: Ref<City | null>) {
  const settings = useSettingsStore()

  const current = shallowRef<CurrentWeather | null>(null)
  const forecast = shallowRef<Forecast | null>(null)
  const loading = ref(false)
  const error = ref<ApiErrorCode | null>(null)

  let controller: AbortController | null = null

  async function load(force = false) {
    controller?.abort()
    const target = city.value

    if (!target) {
      current.value = null
      forecast.value = null
      loading.value = false
      return
    }

    const request = new AbortController()
    controller = request
    loading.value = true
    error.value = null

    try {
      const options = { signal: request.signal, force }
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(target, settings.locale, options),
        fetchForecast(target, settings.locale, options),
      ])
      current.value = currentData
      forecast.value = forecastData
    } catch (reason) {
      if (isAbortError(reason)) return
      error.value = toErrorCode(reason)
    } finally {
      if (controller === request) loading.value = false
    }
  }

  watch([() => city.value?.id, () => settings.locale], () => load(), { immediate: true })

  onBeforeUnmount(() => controller?.abort())

  return { current, forecast, loading, error, reload: load }
}
