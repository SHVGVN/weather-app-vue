<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/base/BaseModal.vue'
import PixelIcon from '@/components/base/PixelIcon.vue'
import { MAX_FAVORITES, useFavoritesStore } from '@/stores/favorites'
import { useSettingsStore } from '@/stores/settings'
import { cityLabel } from '@/utils/format'
import type { City } from '@/types/weather'

const { t } = useI18n()
const favorites = useFavoritesStore()
const settings = useSettingsStore()

const lastPending = shallowRef<City | null>(null)

watch(
  () => favorites.pending,
  (city) => {
    if (city) lastPending.value = city
  },
)

const pendingName = computed(() =>
  lastPending.value ? cityLabel(lastPending.value, settings.locale) : '',
)
</script>

<template>
  <BaseModal
    :open="favorites.pending !== null"
    :title="t('favorites.limitTitle')"
    @close="favorites.dismissPending()"
  >
    <p class="limit__text">
      {{ t('favorites.limitText', { city: pendingName, max: MAX_FAVORITES }) }}
    </p>
    <ul class="limit__list">
      <li v-for="city in favorites.items" :key="city.id" class="limit__item">
        <PixelIcon name="star" :scale="2" />
        <span class="limit__name">{{ cityLabel(city, settings.locale) }}</span>
        <span class="limit__country">{{ city.country }}</span>
        <button
          type="button"
          class="px-btn px-btn--danger px-btn--icon"
          :aria-label="t('favorites.removeCity', { city: cityLabel(city, settings.locale) })"
          :title="t('favorites.removeCity', { city: cityLabel(city, settings.locale) })"
          @click="favorites.replaceWithPending(city.id)"
        >
          <PixelIcon name="trash" :scale="2" />
        </button>
      </li>
    </ul>
    <template #actions>
      <button type="button" class="px-btn px-btn--ghost" @click="favorites.dismissPending()">
        {{ t('modal.cancel') }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.limit__text {
  margin-bottom: 16px;
}

.limit__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.limit__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 4px 12px;
  background: var(--c-panel-alt);
}

.limit__name {
  font-weight: 600;
}

.limit__country {
  margin-left: auto;
  font-size: 16px;
  color: var(--c-muted);
}
</style>
