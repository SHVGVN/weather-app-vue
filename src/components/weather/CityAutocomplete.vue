<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseLoader from '@/components/base/BaseLoader.vue'
import PixelIcon from '@/components/base/PixelIcon.vue'
import { searchCities } from '@/api/openWeather'
import { isAbortError, toErrorCode, type ApiErrorCode } from '@/api/http'
import { useSettingsStore } from '@/stores/settings'
import { cityLabel } from '@/utils/format'
import { debounce } from '@/utils/debounce'
import type { City } from '@/types/weather'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_DELAY = 350

const props = defineProps<{ city: City | null; autofocus?: boolean }>()
const emit = defineEmits<{ select: [city: City] }>()

const { t } = useI18n()
const settings = useSettingsStore()
const baseId = useId()
const listId = `${baseId}-list`
const inputId = `${baseId}-input`

const query = ref('')
const results = ref<City[]>([])
const open = ref(false)
const loading = ref(false)
const focused = ref(false)
const activeIndex = ref(-1)
const error = ref<ApiErrorCode | null>(null)

let controller: AbortController | null = null

const selectedLabel = computed(() => (props.city ? cityLabel(props.city, settings.locale) : ''))
const trimmed = computed(() => query.value.trim())
const tooShort = computed(() => trimmed.value.length < MIN_QUERY_LENGTH)
const activeDescendant = computed(() =>
  activeIndex.value >= 0 ? `${listId}-${activeIndex.value}` : undefined,
)

watch(
  selectedLabel,
  (label) => {
    if (!focused.value) query.value = label
  },
  { immediate: true },
)

async function runSearch(value: string) {
  controller?.abort()
  const request = new AbortController()
  controller = request

  try {
    results.value = await searchCities(value, request.signal)
    error.value = null
  } catch (reason) {
    if (isAbortError(reason)) return
    results.value = []
    error.value = toErrorCode(reason)
  } finally {
    if (controller === request) loading.value = false
  }
}

const search = debounce(runSearch, DEBOUNCE_DELAY)

function onInput() {
  activeIndex.value = -1
  open.value = trimmed.value.length > 0

  if (tooShort.value) {
    search.cancel()
    controller?.abort()
    results.value = []
    loading.value = false
    return
  }

  loading.value = true
  search(trimmed.value)
}

function select(city: City) {
  emit('select', city)
  query.value = cityLabel(city, settings.locale)
  close()
}

function close() {
  open.value = false
  activeIndex.value = -1
}

function move(step: number) {
  if (!open.value && results.value.length) open.value = true
  const count = results.value.length
  if (!count) return
  activeIndex.value = (activeIndex.value + step + count) % count
}

function onEnter() {
  const city = results.value[activeIndex.value] ?? results.value[0]
  if (open.value && city) select(city)
}

function onFocus(event: FocusEvent) {
  focused.value = true
  ;(event.target as HTMLInputElement).select()
  if (results.value.length && !tooShort.value) open.value = true
}

function onBlur() {
  focused.value = false
  close()
  if (!trimmed.value || props.city) query.value = selectedLabel.value
}

onBeforeUnmount(() => {
  search.cancel()
  controller?.abort()
})
</script>

<template>
  <div class="autocomplete" :class="{ 'is-open': open }">
    <label :for="inputId" class="visually-hidden">{{ t('search.label') }}</label>
    <input
      :id="inputId"
      v-model="query"
      class="px-input autocomplete__input"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      :autofocus="autofocus"
      :placeholder="t('search.placeholder')"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="activeDescendant"
      aria-autocomplete="list"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="onEnter"
      @keydown.esc="close"
    />
    <BaseLoader v-if="loading" class="autocomplete__spinner" size="sm" />

    <div v-show="open" class="autocomplete__panel pixel-box">
      <p v-if="tooShort" class="autocomplete__note">{{ t('search.hint') }}</p>
      <p v-else-if="loading && !results.length" class="autocomplete__note">
        {{ t('search.loading') }}
      </p>
      <p v-else-if="error" class="autocomplete__note autocomplete__note--error">
        {{ t(`errors.${error}`) }}
      </p>
      <p v-else-if="!results.length" class="autocomplete__note">{{ t('search.empty') }}</p>
      <ul :id="listId" role="listbox" class="autocomplete__list">
        <template v-if="!tooShort">
          <li
            v-for="(option, index) in results"
            :id="`${listId}-${index}`"
            :key="option.id"
            role="option"
            class="autocomplete__option"
            :class="{ 'is-active': index === activeIndex }"
            :aria-selected="index === activeIndex"
            @mousedown.prevent="select(option)"
            @mouseenter="activeIndex = index"
          >
            <PixelIcon name="pin" :scale="2" />
            <span class="autocomplete__name">{{ cityLabel(option, settings.locale) }}</span>
            <span class="autocomplete__meta">
              <template v-if="option.state">{{ option.state }}, </template>{{ option.country }}
            </span>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.autocomplete {
  position: relative;
  flex: 1 1 280px;
  max-width: 440px;
  min-width: 0;
}

.autocomplete__input {
  width: calc(100% - var(--px) * 2);
  padding-right: 52px;
}

.autocomplete__spinner {
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%);
}

.autocomplete__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: var(--px);
  right: var(--px);
  z-index: 20;
}

.autocomplete__note {
  padding: 12px 14px;
  font-size: 18px;
  color: var(--c-muted);
}

.autocomplete__note--error {
  color: var(--c-danger);
}

.autocomplete__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

.autocomplete__option + .autocomplete__option {
  border-top: 2px dashed var(--c-panel-shade);
}

.autocomplete__option.is-active {
  background: var(--c-yellow);
  color: var(--c-border);
}

.autocomplete__name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.autocomplete__meta {
  margin-left: auto;
  font-size: 16px;
  color: var(--c-muted);
  white-space: nowrap;
}

.autocomplete__option.is-active .autocomplete__meta {
  color: inherit;
}
</style>
