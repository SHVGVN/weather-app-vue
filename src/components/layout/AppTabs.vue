<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { MAX_FAVORITES, useFavoritesStore } from '@/stores/favorites'

const { t } = useI18n()
const favorites = useFavoritesStore()
</script>

<template>
  <nav class="tabs" :aria-label="t('tabs.label')">
    <RouterLink to="/" class="tab" exact-active-class="is-active">
      {{ t('tabs.home') }}
    </RouterLink>
    <RouterLink to="/favorites" class="tab" exact-active-class="is-active">
      {{ t('tabs.favorites') }}
      <span class="tab__badge">{{ favorites.items.length }}/{{ MAX_FAVORITES }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 12px;
  padding: 0 8px;
}

.tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px 10px;
  font-family: var(--font-display);
  font-size: 12px;
  line-height: 1.4;
  color: var(--c-text);
  text-decoration: none;
  background: var(--c-tab);
  box-shadow:
    0 calc(var(--px) * -1) 0 0 var(--c-border),
    calc(var(--px) * -1) 0 0 0 var(--c-border),
    var(--px) 0 0 0 var(--c-border);
  transform: translateY(4px);
}

.tab:hover {
  filter: brightness(1.05);
}

.tab.is-active {
  z-index: 1;
  padding-bottom: 14px;
  background: var(--c-panel);
  transform: translateY(var(--px));
}

.tab:focus-visible {
  outline: var(--px) dashed var(--c-accent);
  outline-offset: 6px;
}

.tab__badge {
  padding: 4px 6px;
  font-size: 10px;
  color: var(--c-border);
  background: var(--c-favorite);
}

@media (max-width: 480px) {
  .tabs {
    gap: 10px;
    padding: 0 4px;
  }

  .tab {
    padding: 12px 12px 8px;
    font-size: 10px;
  }
}
</style>
