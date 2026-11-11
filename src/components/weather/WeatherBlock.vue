<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseLoader from '@/components/base/BaseLoader.vue'
import BaseSegmented from '@/components/base/BaseSegmented.vue'
import PixelIcon from '@/components/base/PixelIcon.vue'
import BlockMessage from './BlockMessage.vue'
import CityAutocomplete from './CityAutocomplete.vue'
import FavoriteToggle from './FavoriteToggle.vue'
import ForecastDays from './ForecastDays.vue'
import TemperatureChart from './TemperatureChart.vue'
import WeatherCard from './WeatherCard.vue'
import { useWeather } from '@/composables/useWeather'
import { useFavoritesStore } from '@/stores/favorites'
import { useSceneStore } from '@/stores/scene'
import { useSettingsStore } from '@/stores/settings'
import { getDailySummaries, getTodayHours } from '@/utils/forecast'
import { sceneFromWeather } from '@/utils/scene'
import { cityLabel, convertTemp, formatCityTime } from '@/utils/format'
import type { City, ViewMode } from '@/types/weather'

const props = withDefaults(
  defineProps<{
    city: City | null
    editable?: boolean
    removable?: boolean
    locating?: boolean
    removeLabel?: string
    sceneSource?: boolean
  }>(),
  { editable: true, removable: false, locating: false, removeLabel: '', sceneSource: false },
)

const emit = defineEmits<{ select: [city: City]; remove: [] }>()

const { t } = useI18n()
const settings = useSettingsStore()
const favorites = useFavoritesStore()
const scene = useSceneStore()
const { current, forecast, loading, error, reload } = useWeather(toRef(props, 'city'))

watch(
  [current, () => props.sceneSource],
  ([weather, isSource]) => {
    if (weather && isSource) scene.setCondition(sceneFromWeather(weather))
  },
  { immediate: true },
)

const mode = ref<ViewMode>('day')

const modeOptions = computed(() => [
  { value: 'day' as const, label: t('mode.day') },
  { value: 'week' as const, label: t('mode.week') },
])

const isFavorite = computed(() => (props.city ? favorites.has(props.city.id) : false))
const title = computed(() => (props.city ? cityLabel(props.city, settings.locale) : ''))
const unit = computed(() => (settings.units === 'imperial' ? '°F' : '°C'))
const hasData = computed(() => Boolean(current.value && forecast.value))

const days = computed(() => (forecast.value ? getDailySummaries(forecast.value) : []))
const hours = computed(() =>
  current.value && forecast.value ? getTodayHours(current.value, forecast.value) : null,
)

const chart = computed(() => {
  const timezone = forecast.value?.city.timezone ?? 0

  if (mode.value === 'week') {
    return {
      title: `${t('chart.week')}, ${unit.value}`,
      labels: days.value.map((day, index) =>
        index === 0
          ? t('weather.today')
          : formatCityTime(day.dt, timezone, settings.locale, { weekday: 'short', day: 'numeric' }),
      ),
      values: days.value.map((day) => convertTemp(day.avg, settings.units)),
    }
  }

  const points = hours.value?.points ?? []
  return {
    title: `${hours.value?.spansNextDay ? t('chart.next') : t('chart.today')}, ${unit.value}`,
    labels: points.map((point, index) =>
      index === 0
        ? t('weather.now')
        : formatCityTime(point.dt, timezone, settings.locale, {
            hour: '2-digit',
            minute: '2-digit',
          }),
    ),
    values: points.map((point) => convertTemp(point.temp, settings.units)),
  }
})

function toggleFavorite() {
  if (props.city) favorites.toggle(props.city)
}
</script>

<template>
  <article class="weather-block pixel-box" :class="{ 'is-favorite': isFavorite }">
    <span v-if="isFavorite" class="weather-block__ribbon" aria-hidden="true">
      <PixelIcon name="star" :scale="2" />
    </span>

    <header class="weather-block__head">
      <CityAutocomplete v-if="editable" :city="city" @select="emit('select', $event)" />
      <h2 v-else class="weather-block__title">
        <PixelIcon name="pin" :scale="2" />
        {{ title }}
        <span v-if="city" class="weather-block__country">{{ city.country }}</span>
      </h2>

      <div class="weather-block__actions">
        <FavoriteToggle v-if="city && editable" :active="isFavorite" @toggle="toggleFavorite" />
        <button
          v-if="city"
          type="button"
          class="px-btn px-btn--ghost px-btn--icon"
          :title="t('block.refresh')"
          :aria-label="t('block.refresh')"
          :disabled="loading"
          @click="reload(true)"
        >
          <span class="weather-block__refresh" :class="{ 'is-spinning': loading }">↻</span>
        </button>
        <button
          v-if="removable"
          type="button"
          class="px-btn px-btn--danger weather-block__remove"
          :class="{ 'px-btn--icon': !removeLabel }"
          :title="removeLabel || t('block.remove')"
          :aria-label="removeLabel || t('block.remove')"
          @click="emit('remove')"
        >
          <PixelIcon name="trash" :scale="2" />
          <span v-if="removeLabel" class="weather-block__remove-label">{{ removeLabel }}</span>
        </button>
      </div>
    </header>

    <BaseSegmented
      v-if="city"
      v-model="mode"
      class="weather-block__modes"
      :options="modeOptions"
      :label="t('mode.label')"
    />

    <div class="weather-block__body" :aria-busy="loading">
      <BlockMessage v-if="locating" icon="sun-cloud" :text="t('block.locating')">
        <BaseLoader size="sm" />
      </BlockMessage>
      <BlockMessage v-else-if="!city" icon="cloud" :text="t('block.empty')" />
      <BlockMessage
        v-else-if="error && !hasData"
        icon="storm"
        tone="error"
        :text="t(`errors.${error}`)"
      >
        <button type="button" class="px-btn px-btn--accent" @click="reload(true)">
          {{ t('errors.retry') }}
        </button>
      </BlockMessage>
      <BaseLoader v-else-if="!hasData" :text="t('block.loading')" />

      <template v-else-if="current && forecast">
        <Transition name="fade" mode="out-in">
          <WeatherCard v-if="mode === 'day'" :weather="current" />
          <ForecastDays v-else :days="days" :timezone="forecast.city.timezone" />
        </Transition>
        <TemperatureChart
          class="weather-block__chart"
          :title="chart.title"
          :labels="chart.labels"
          :values="chart.values"
          :unit="unit"
        />
        <p v-if="error" class="weather-block__error" role="alert">{{ t(`errors.${error}`) }}</p>
        <BaseLoader v-if="loading" overlay />
      </template>
    </div>
  </article>
</template>

<style scoped>
.weather-block {
  --box-bg: var(--c-panel);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  transition: box-shadow 0.3s ease;
}

.weather-block.is-favorite {
  --box-border: var(--c-favorite);
  box-shadow:
    0 -8px 0 0 var(--c-favorite),
    0 8px 0 0 var(--c-favorite),
    -8px 0 0 0 var(--c-favorite),
    8px 0 0 0 var(--c-favorite),
    0 -12px 0 0 var(--c-border),
    0 12px 0 0 var(--c-border),
    -12px 0 0 0 var(--c-border),
    12px 0 0 0 var(--c-border),
    inset -4px -4px 0 0 var(--c-panel-shade);
}

.weather-block__ribbon {
  position: absolute;
  top: -22px;
  right: 24px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: var(--c-favorite);
  box-shadow: var(--shadow-border);
}

.weather-block__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.weather-block__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 18px;
  line-height: 1.5;
}

.weather-block__country {
  padding: 2px 6px;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--c-border);
  background: var(--c-mint);
}

.weather-block__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.weather-block__refresh {
  display: inline-block;
  font-size: 22px;
}

.weather-block__refresh.is-spinning {
  animation: spin 0.8s steps(8) infinite;
}

.weather-block__modes {
  align-self: flex-start;
}

.weather-block__body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 200px;
}

.weather-block__chart {
  padding: 4px;
}

.weather-block__error {
  color: var(--c-danger);
  font-weight: 600;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .weather-block {
    padding: 16px 12px;
  }

  .weather-block__title {
    font-size: 14px;
  }

  .weather-block__actions {
    margin-left: 0;
  }

  .weather-block__remove {
    width: 40px;
    padding: 0;
  }

  .weather-block__remove-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
}
</style>
