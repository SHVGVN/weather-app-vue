<script setup lang="ts">
import PixelIcon from '@/components/base/PixelIcon.vue'
import type { IconName } from '@/utils/pixelIcons'

withDefaults(defineProps<{ icon: IconName; text: string; tone?: 'default' | 'error' }>(), {
  tone: 'default',
})
</script>

<template>
  <div
    class="message lcd"
    :class="`message--${tone}`"
    :role="tone === 'error' ? 'alert' : undefined"
  >
    <PixelIcon :name="icon" :scale="4" class="message__icon" />
    <p class="message__text">{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin: var(--px);
  padding: 36px 16px;
  text-align: center;
}

.message__text {
  max-width: 420px;
  font-size: 20px;
  font-weight: 600;
}

.message--error .message__text {
  color: var(--c-danger);
}

.message__icon {
  animation: float 2s steps(2, jump-none) infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>
