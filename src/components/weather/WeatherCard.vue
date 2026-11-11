<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PixelIcon from '@/components/base/PixelIcon.vue'
import { useSettingsStore } from '@/stores/settings'
import { iconFromCode } from '@/utils/pixelIcons'
import { capitalize, convertSpeed, formatCityTime, formatTemp } from '@/utils/format'
import type { CurrentWeather } from '@/types/weather'

const props = defineProps<{ weather: CurrentWeather }>()

const { t } = useI18n()
const settings = useSettingsStore()

const condition = computed(() => props.weather.weather[0])
const icon = computed(() => iconFromCode(condition.value?.icon ?? '03d'))
const temp = (value: number) => formatTemp(value, settings.units)
const unitLetter = computed(() => (settings.units === 'imperial' ? 'F' : 'C'))
const time = (dt: number) =>
  formatCityTime(dt, props.weather.timezone, settings.locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

const date = computed(() =>
  formatCityTime(props.weather.dt, props.weather.timezone, settings.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
)

const stats = computed(() => {
  const { main, wind, clouds, sys } = props.weather
  const speedUnit =
    settings.units === 'imperial' ? t('units.speedImperial') : t('units.speedMetric')
  return [
    { key: 'feelsLike', value: temp(main.feels_like) },
    { key: 'minMax', value: `${temp(main.temp_min)} / ${temp(main.temp_max)}` },
    { key: 'humidity', value: `${main.humidity}%` },
    { key: 'wind', value: `${convertSpeed(wind.speed, settings.units).toFixed(1)} ${speedUnit}` },
    { key: 'pressure', value: `${main.pressure} ${t('units.pressure')}` },
    { key: 'clouds', value: `${clouds.all}%` },
    { key: 'sunrise', value: time(sys.sunrise) },
    { key: 'sunset', value: time(sys.sunset) },
  ]
})
</script>

<template>
  <div class="weather-card lcd">
    <div class="weather-card__main">
      <PixelIcon :name="icon" :scale="6" class="weather-card__icon" />
      <div class="weather-card__summary">
        <p class="weather-card__date">{{ capitalize(date) }} · {{ time(weather.dt) }}</p>
        <p class="weather-card__temp">
          {{ temp(weather.main.temp) }}<span class="weather-card__unit">{{ unitLetter }}</span>
        </p>
        <p class="weather-card__desc">{{ capitalize(condition?.description ?? '') }}</p>
      </div>
    </div>
    <dl class="weather-card__stats">
      <div v-for="stat in stats" :key="stat.key" class="weather-card__stat">
        <dt>{{ t(`weather.${stat.key}`) }}</dt>
        <dd>{{ stat.value }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.weather-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 20px;
  margin: var(--px);
  padding: 20px;
}

.weather-card__main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.weather-card__icon {
  animation: bob 1.6s steps(2, jump-none) infinite;
}

.weather-card__date {
  font-size: 16px;
  color: var(--c-muted);
}

.weather-card__temp {
  margin: 4px 0;
  font-family: var(--font-numbers);
  font-size: 88px;
  line-height: 0.85;
}

.weather-card__unit {
  font-size: 44px;
  vertical-align: top;
}

.weather-card__desc {
  font-size: 22px;
  font-weight: 600;
}

.weather-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  align-content: center;
}

.weather-card__stat {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 2px dashed var(--c-screen-shade);
}

.weather-card__stat dt {
  color: var(--c-muted);
}

.weather-card__stat dd {
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 860px) {
  .weather-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .weather-card {
    padding: 16px 12px;
  }

  .weather-card__main {
    gap: 12px;
  }

  .weather-card__icon {
    width: 64px;
    height: 64px;
  }

  .weather-card__temp {
    font-size: 68px;
  }

  .weather-card__stats {
    grid-template-columns: 1fr;
  }
}
</style>
