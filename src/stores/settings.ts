import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { isRecord, readStorage, writeStorage } from '@/utils/storage'
import type { Locale, Theme, Units } from '@/types/weather'

const STORAGE_KEY = 'pixel-weather:settings'

function detectLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en'
}

function detectTheme(): Theme {
  const hour = new Date().getHours()
  return hour >= 7 && hour < 20 ? 'day' : 'night'
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = readStorage<Record<string, unknown>>(STORAGE_KEY, {}, isRecord)

  const locale = ref<Locale>(
    saved.locale === 'uk' || saved.locale === 'en' ? saved.locale : detectLocale(),
  )
  const units = ref<Units>(saved.units === 'imperial' ? 'imperial' : 'metric')
  const theme = ref<Theme>(
    saved.theme === 'day' || saved.theme === 'night' ? saved.theme : detectTheme(),
  )

  function toggleTheme() {
    theme.value = theme.value === 'day' ? 'night' : 'day'
  }

  watch([locale, units, theme], () => {
    writeStorage(STORAGE_KEY, { locale: locale.value, units: units.value, theme: theme.value })
  })

  return { locale, units, theme, toggleTheme }
})
