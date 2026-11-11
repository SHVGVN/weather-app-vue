<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import WeatherBlock from '@/components/weather/WeatherBlock.vue'
import BlockMessage from '@/components/weather/BlockMessage.vue'
import { useFavoritesStore } from '@/stores/favorites'
import { shredLeavingElement } from '@/utils/transitions'

const { t } = useI18n()
const favorites = useFavoritesStore()
</script>

<template>
  <div class="favorites">
    <TransitionGroup name="block" tag="div" class="block-list" @before-leave="shredLeavingElement">
      <WeatherBlock
        v-for="(city, index) in favorites.items"
        :key="city.id"
        :city="city"
        :editable="false"
        removable
        :scene-source="index === 0"
        :remove-label="t('favorites.removeShort')"
        @remove="favorites.remove(city.id)"
      />
    </TransitionGroup>

    <Transition name="empty">
      <BlockMessage v-if="!favorites.items.length" icon="star-empty" :text="t('favorites.empty')">
        <p class="favorites__hint">{{ t('favorites.emptyHint') }}</p>
        <RouterLink to="/" class="px-btn px-btn--accent favorites__link">
          {{ t('favorites.toHome') }}
        </RouterLink>
      </BlockMessage>
    </Transition>
  </div>
</template>

<style scoped>
.favorites__hint {
  color: var(--c-muted);
}

.favorites__link {
  text-decoration: none;
}

.empty-enter-active {
  transition:
    opacity 0.4s ease 0.9s,
    transform 0.4s ease 0.9s;
}

.empty-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
