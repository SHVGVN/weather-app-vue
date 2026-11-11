import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { DEFAULT_CITY, resolveUserCity } from '@/api/location'
import { createId } from '@/utils/id'
import { isCity, isRecord, readStorage, writeStorage } from '@/utils/storage'
import type { City } from '@/types/weather'

export const MAX_BLOCKS = 5
const STORAGE_KEY = 'pixel-weather:blocks'

export interface WeatherBlockState {
  id: string
  city: City | null
}

function isBlockList(value: unknown): value is WeatherBlockState[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) && typeof item.id === 'string' && (item.city === null || isCity(item.city)),
    )
  )
}

function createBlock(): WeatherBlockState {
  return { id: createId(), city: null }
}

export const useBlocksStore = defineStore('blocks', () => {
  const saved = readStorage<WeatherBlockState[]>(STORAGE_KEY, [], isBlockList).slice(0, MAX_BLOCKS)

  const items = ref<WeatherBlockState[]>(saved.length ? saved : [createBlock()])
  const locating = ref(false)

  const canAdd = computed(() => items.value.length < MAX_BLOCKS)
  const canRemove = computed(() => items.value.length > 1)

  function add(): string | null {
    if (!canAdd.value) return null
    const block = createBlock()
    items.value.push(block)
    return block.id
  }

  function remove(id: string) {
    if (!canRemove.value) return
    items.value = items.value.filter((block) => block.id !== id)
  }

  function setCity(id: string, city: City) {
    const block = items.value.find((item) => item.id === id)
    if (block) block.city = city
  }

  async function locateFirst() {
    const first = items.value[0]
    if (!first || first.city || locating.value) return

    locating.value = true
    let city: City
    try {
      city = await resolveUserCity()
    } catch {
      city = DEFAULT_CITY
    } finally {
      locating.value = false
    }
    if (!first.city) first.city = city
  }

  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })

  return { items, locating, canAdd, canRemove, add, remove, setCity, locateFirst }
})
