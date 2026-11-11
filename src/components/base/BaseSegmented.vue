<script setup lang="ts" generic="T extends string">
defineProps<{ options: { value: T; label: string }[]; label: string }>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="segmented" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segmented__option"
      :class="{ 'is-active': model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  margin: var(--px);
  background: var(--c-panel-shade);
  box-shadow: var(--shadow-border);
}

.segmented__option {
  min-width: 48px;
  min-height: 36px;
  padding: 4px 12px;
  border: 0;
  font-weight: 600;
  color: var(--c-muted);
  background: transparent;
  cursor: pointer;
}

.segmented__option + .segmented__option {
  box-shadow: inset var(--px) 0 0 0 var(--c-border);
  padding-left: 16px;
}

.segmented__option.is-active {
  color: var(--c-border);
  background: var(--c-yellow);
}

.segmented__option.is-active:not(:first-child) {
  box-shadow:
    inset var(--px) 0 0 0 var(--c-border),
    inset calc(var(--px) * -1) calc(var(--px) * -1) 0 0 var(--c-yellow-shade);
}

.segmented__option.is-active:first-child {
  box-shadow: inset calc(var(--px) * -1) calc(var(--px) * -1) 0 0 var(--c-yellow-shade);
}

.segmented__option:hover:not(.is-active) {
  color: var(--c-text);
}

.segmented__option:focus-visible {
  outline: var(--px) dashed var(--c-accent);
  outline-offset: 4px;
  position: relative;
  z-index: 1;
}
</style>
