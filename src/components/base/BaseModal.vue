<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const CLOSE_DURATION = 220

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const titleId = useId()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const closing = ref(false)

let closeTimer: ReturnType<typeof setTimeout> | undefined

function sync(open: boolean) {
  const element = dialog.value
  if (!element) return

  if (open) {
    clearTimeout(closeTimer)
    closing.value = false
    if (!element.open) element.showModal()
    return
  }

  if (element.open && !closing.value) {
    closing.value = true
    closeTimer = setTimeout(() => {
      element.close()
      closing.value = false
    }, CLOSE_DURATION)
  }
}

watch(() => props.open, sync, { flush: 'post' })
onMounted(() => sync(props.open))
onBeforeUnmount(() => clearTimeout(closeTimer))

function onCancel(event: Event) {
  event.preventDefault()
  emit('close')
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :class="{ 'is-closing': closing }"
    :aria-labelledby="titleId"
    @cancel="onCancel"
    @click="onBackdropClick"
  >
    <div class="modal__box pixel-box">
      <header class="modal__head">
        <h2 :id="titleId" class="modal__title">{{ title }}</h2>
        <button
          type="button"
          class="px-btn px-btn--ghost px-btn--icon modal__close"
          :aria-label="t('modal.close')"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>
      <div class="modal__body">
        <slot />
      </div>
      <footer v-if="$slots.actions" class="modal__actions">
        <slot name="actions" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  width: min(480px, calc(100vw - 32px));
  max-width: none;
  padding: 8px;
  border: 0;
  overflow: visible;
  color: var(--c-text);
  background: transparent;
}

.modal[open] {
  animation: modal-in 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal::backdrop {
  background-color: var(--c-backdrop);
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.12) 2px, transparent 2px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.12) 2px, transparent 2px);
  background-size: 8px 8px;
}

.modal[open]::backdrop {
  animation: backdrop-in 0.32s ease;
}

.modal.is-closing {
  pointer-events: none;
  animation: modal-out 0.22s ease-in forwards;
}

.modal.is-closing::backdrop {
  animation: backdrop-out 0.22s ease-in forwards;
}

.modal__box {
  --box-bg: var(--c-panel);
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 12px 20px;
  background: var(--c-accent);
  box-shadow: inset 0 calc(var(--px) * -1) 0 0 var(--c-border);
}

.modal__title {
  font-family: var(--font-display);
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-on-accent);
}

.modal__close {
  width: 32px;
  min-height: 32px;
  font-size: 16px;
}

.modal__body {
  padding: 20px 20px 8px;
}

.modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px 20px;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes modal-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
}

@keyframes backdrop-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes backdrop-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
