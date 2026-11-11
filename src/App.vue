<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppTabs from '@/components/layout/AppTabs.vue'
import SkyScene from '@/components/layout/SkyScene.vue'
import FavoritesLimitModal from '@/components/weather/FavoritesLimitModal.vue'
import { useSettingsStore } from '@/stores/settings'

const { t, locale } = useI18n()
const settings = useSettingsStore()

watch(
  () => settings.locale,
  (value) => {
    locale.value = value
    document.documentElement.lang = value
  },
  { immediate: true },
)

const THEME_SWITCH_CLASS = 'theme-switching'
const THEME_SWITCH_DURATION = 1700
let themeTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => settings.theme,
  (value, previous) => {
    const root = document.documentElement
    if (previous) {
      clearTimeout(themeTimer)
      root.classList.add(THEME_SWITCH_CLASS)
      themeTimer = setTimeout(
        () => root.classList.remove(THEME_SWITCH_CLASS),
        THEME_SWITCH_DURATION,
      )
    }
    root.dataset.theme = value
  },
  { immediate: true },
)
</script>

<template>
  <div class="app">
    <SkyScene />
    <AppHeader />

    <main class="app__main container">
      <AppTabs />
      <section class="app__board pixel-box">
        <RouterView />
      </section>
    </main>

    <footer class="app__footer container">
      <span>© {{ new Date().getFullYear() }} {{ t('app.title') }}</span>
      <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">
        {{ t('app.footer') }}
      </a>
    </footer>

    <FavoritesLimitModal />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app__main {
  flex: 1;
}

.app__board {
  padding: 32px 24px;
}

.app__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding-top: 28px;
  padding-bottom: 28px;
  font-size: 16px;
  color: var(--c-text);
}

@media (max-width: 600px) {
  .app__board {
    padding: 24px 12px;
  }

  .app__footer {
    justify-content: center;
    text-align: center;
  }
}
</style>
