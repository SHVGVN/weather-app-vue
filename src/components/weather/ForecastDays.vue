<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PixelIcon from '@/components/base/PixelIcon.vue'
import { useSettingsStore } from '@/stores/settings'
import { iconFromCode } from '@/utils/pixelIcons'
import { capitalize, formatCityTime, formatTemp } from '@/utils/format'
import type { DaySummary } from '@/types/weather'

const props = defineProps<{ days: DaySummary[]; timezone: number }>()

const { t } = useI18n()
const settings = useSettingsStore()

const temp = (value: number) => formatTemp(value, settings.units)
const weekday = (day: DaySummary, index: number) =>
  index === 0
    ? t('weather.today')
    : capitalize(formatCityTime(day.dt, props.timezone, settings.locale, { weekday: 'short' }))
const date = (day: DaySummary) =>
  formatCityTime(day.dt, props.timezone, settings.locale, { day: 'numeric', month: 'short' })
</script>

<template>
  <ul class="days lcd">
    <li
      v-for="(day, index) in days"
      :key="day.date"
      class="day"
      :class="{ 'is-today': index === 0 }"
    >
      <p class="day__name">{{ weekday(day, index) }}</p>
      <p class="day__date">{{ date(day) }}</p>
      <PixelIcon :name="iconFromCode(day.icon)" :scale="3" class="day__icon" />
      <p class="day__avg">
        <span class="visually-hidden">{{ t('weather.average') }}</span>{{ temp(day.avg) }}
      </p>
      <p class="day__range">{{ temp(day.min) }} / {{ temp(day.max) }}</p>
      <p class="day__desc">{{ capitalize(day.description) }}</p>
      <p class="day__pop">{{ t('weather.rainChance') }}: {{ Math.round(day.pop * 100) }}%</p>
    </li>
  </ul>
</template>

<style scoped>
.days {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin: var(--px);
  padding: 16px;
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  text-align: center;
  background: color-mix(in srgb, var(--c-panel) 55%, transparent);
  box-shadow: inset 0 0 0 2px var(--c-screen-shade);
}

.day.is-today {
  background: color-mix(in srgb, var(--c-yellow) 35%, transparent);
  box-shadow: inset 0 0 0 2px var(--c-yellow-shade);
}

.day__name {
  font-weight: 700;
}

.day__date,
.day__range,
.day__pop {
  font-size: 16px;
  color: var(--c-muted);
}

.day__icon {
  margin: 6px 0;
}

.day__avg {
  font-family: var(--font-numbers);
  font-size: 44px;
  line-height: 0.9;
}

.day__desc {
  min-height: 2.6em;
  font-size: 16px;
  line-height: 1.3;
}

@media (max-width: 860px) {
  .days {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .days {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }

  .day {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'icon name avg'
      'icon desc range';
    align-items: center;
    column-gap: 12px;
    row-gap: 2px;
    text-align: left;
  }

  .day__icon {
    grid-area: icon;
    margin: 0;
  }

  .day__name {
    grid-area: name;
  }

  .day__avg {
    grid-area: avg;
    text-align: right;
  }

  .day__desc {
    grid-area: desc;
    min-height: 0;
  }

  .day__range {
    grid-area: range;
    text-align: right;
  }

  .day__date,
  .day__pop {
    display: none;
  }
}
</style>
