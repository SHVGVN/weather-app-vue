<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PixelIcon from '@/components/base/PixelIcon.vue'

defineProps<{ active: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="px-btn favorite-toggle"
    :class="active ? 'is-active' : 'px-btn--ghost'"
    :aria-pressed="active"
    :title="active ? t('favorites.remove') : t('favorites.add')"
    @click="emit('toggle')"
  >
    <PixelIcon :name="active ? 'star' : 'star-empty'" :scale="2" />
    <span class="favorite-toggle__label">
      {{ active ? t('favorites.badge') : t('favorites.add') }}
    </span>
  </button>
</template>

<style scoped>
.favorite-toggle.is-active {
  --btn-bg: var(--c-favorite);
  --btn-shade: var(--c-yellow-shade);
}

@media (max-width: 600px) {
  .favorite-toggle {
    width: 40px;
    padding: 0;
  }

  .favorite-toggle__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
}
</style>
