<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseSegmented from '@/components/base/BaseSegmented.vue'
import PixelIcon from '@/components/base/PixelIcon.vue'
import { useSettingsStore } from '@/stores/settings'
import type { Locale, Units } from '@/types/weather'

const { t } = useI18n()
const settings = useSettingsStore()

const localeOptions: { value: Locale; label: string }[] = [
  { value: 'uk', label: 'UK' },
  { value: 'en', label: 'EN' },
]

const unitOptions: { value: Units; label: string }[] = [
  { value: 'metric', label: '°C' },
  { value: 'imperial', label: '°F' },
]

const themeLabel = computed(() =>
  settings.theme === 'day' ? t('settings.toNight') : t('settings.toDay'),
)
</script>

<template>
  <header class="header container">
    <RouterLink to="/" class="logo">
      <span class="logo__screen">
        <PixelIcon name="sun-cloud" :scale="3" />
      </span>
      <span class="logo__text">
        <span class="logo__title">{{ t('app.title') }}</span>
        <span class="logo__tagline">{{ t('app.tagline') }}</span>
      </span>
    </RouterLink>

    <div class="header__controls">
      <BaseSegmented
        v-model="settings.locale"
        :options="localeOptions"
        :label="t('settings.language')"
      />
      <BaseSegmented v-model="settings.units" :options="unitOptions" :label="t('settings.units')" />
      <button
        type="button"
        class="px-btn px-btn--ghost px-btn--icon theme-toggle"
        :title="themeLabel"
        :aria-label="themeLabel"
        @click="settings.toggleTheme()"
      >
        <PixelIcon :name="settings.theme === 'day' ? 'moon' : 'sun'" :scale="2" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 28px;
  padding-bottom: 28px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}

.logo__screen {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin: var(--px);
  border-radius: 50% 50% 46% 46%;
  background: var(--c-accent);
  box-shadow:
    0 0 0 var(--px) var(--c-border),
    inset -6px -6px 0 0 var(--c-accent-shade),
    inset 6px 6px 0 0 rgba(255, 255, 255, 0.3);
}

.logo__text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.logo__title {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--c-text);
  text-shadow: 3px 3px 0 var(--c-accent);
}

.logo__tagline {
  font-size: 16px;
  color: var(--c-text);
}

.header__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .header {
    justify-content: center;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .logo__screen {
    width: 56px;
    height: 56px;
  }

  .logo__title {
    font-size: 16px;
  }

  .logo__tagline {
    font-size: 16px;
  }

  .header__controls {
    justify-content: center;
  }
}
</style>
