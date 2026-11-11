<script setup lang="ts">
withDefaults(defineProps<{ text?: string; overlay?: boolean; size?: 'sm' | 'md' }>(), {
  text: '',
  overlay: false,
  size: 'md',
})
</script>

<template>
  <div
    class="loader"
    :class="[`loader--${size}`, { 'loader--overlay': overlay }]"
    role="status"
    aria-live="polite"
  >
    <span class="loader__dots" aria-hidden="true">
      <span class="loader__dot" />
      <span class="loader__dot" />
      <span class="loader__dot" />
    </span>
    <span v-if="text" class="loader__text">{{ text }}</span>
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px 16px;
  color: var(--c-muted);
}

.loader--sm {
  flex-direction: row;
  gap: 8px;
  padding: 0;
}

.loader--overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--c-panel) 70%, transparent);
}

.loader__dots {
  display: flex;
  gap: 8px;
}

.loader__dot {
  width: 14px;
  height: 14px;
  background: var(--c-accent);
  box-shadow: inset -4px -4px 0 0 var(--c-accent-shade);
  animation: hop 0.9s steps(2, jump-none) infinite;
}

.loader--sm .loader__dot {
  width: 8px;
  height: 8px;
  box-shadow: inset -2px -2px 0 0 var(--c-accent-shade);
}

.loader__dot:nth-child(2) {
  background: var(--c-yellow);
  box-shadow: inset -4px -4px 0 0 var(--c-yellow-shade);
  animation-delay: 0.15s;
}

.loader__dot:nth-child(3) {
  background: var(--c-mint);
  box-shadow: inset -4px -4px 0 0 var(--c-mint-shade);
  animation-delay: 0.3s;
}

.loader__text {
  font-size: 18px;
}

@keyframes hop {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
