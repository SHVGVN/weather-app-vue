import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { isCityList, readStorage, writeStorage } from '@/utils/storage'
import type { City } from '@/types/weather'

export const MAX_FAVORITES = 5
const STORAGE_KEY = 'pixel-weather:favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<City[]>(
    readStorage<City[]>(STORAGE_KEY, [], isCityList).slice(0, MAX_FAVORITES),
  )
  const pending = ref<City | null>(null)

  const ids = computed(() => new Set(items.value.map((city) => city.id)))
  const isFull = computed(() => items.value.length >= MAX_FAVORITES)

  function has(id: string): boolean {
    return ids.value.has(id)
  }

  function add(city: City) {
    if (has(city.id)) return
    if (isFull.value) {
      pending.value = city
      return
    }
    items.value.push(city)
  }

  function remove(id: string) {
    items.value = items.value.filter((city) => city.id !== id)
  }

  function toggle(city: City) {
    if (has(city.id)) {
      remove(city.id)
    } else {
      add(city)
    }
  }

  function replaceWithPending(id: string) {
    const city = pending.value
    pending.value = null
    remove(id)
    if (city) add(city)
  }

  function dismissPending() {
    pending.value = null
  }

  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })

  return { items, pending, isFull, has, add, remove, toggle, replaceWithPending, dismissPending }
})
