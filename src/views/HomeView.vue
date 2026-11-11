<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/base/BaseModal.vue'
import WeatherBlock from '@/components/weather/WeatherBlock.vue'
import { MAX_BLOCKS, useBlocksStore, type WeatherBlockState } from '@/stores/blocks'
import { useSettingsStore } from '@/stores/settings'
import { cityLabel } from '@/utils/format'
import { shredLeavingElement } from '@/utils/transitions'

const { t } = useI18n()
const blocks = useBlocksStore()
const settings = useSettingsStore()

const pendingRemoveId = ref<string | null>(null)

const removeTarget = ref<WeatherBlockState | null>(null)

const removeText = computed(() =>
  removeTarget.value?.city
    ? t('modal.removeText', { city: cityLabel(removeTarget.value.city, settings.locale) })
    : t('modal.removeEmpty'),
)

function askRemove(block: WeatherBlockState) {
  removeTarget.value = { ...block }
  pendingRemoveId.value = block.id
}

async function addBlock() {
  const id = blocks.add()
  if (!id) return
  await nextTick()
  const element = document.querySelector<HTMLElement>(`[data-block-id="${id}"]`)
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  element?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
}

function confirmRemove() {
  if (pendingRemoveId.value) blocks.remove(pendingRemoveId.value)
  pendingRemoveId.value = null
}

onMounted(() => blocks.locateFirst())
</script>

<template>
  <div class="home">
    <TransitionGroup name="block" tag="div" class="block-list" @before-leave="shredLeavingElement">
      <WeatherBlock
        v-for="(block, index) in blocks.items"
        :key="block.id"
        :data-block-id="block.id"
        :city="block.city"
        :removable="blocks.canRemove"
        :locating="index === 0 && blocks.locating"
        :scene-source="index === 0"
        @select="blocks.setCity(block.id, $event)"
        @remove="askRemove(block)"
      />
    </TransitionGroup>

    <div class="home__footer">
      <button
        type="button"
        class="px-btn px-btn--mint home__add"
        :disabled="!blocks.canAdd"
        :aria-label="t('block.add')"
        @click="addBlock"
      >
        <span class="home__plus" aria-hidden="true">+</span>
        {{ t('block.add') }}
      </button>
      <span class="home__counter">
        {{ t('block.counter', { count: blocks.items.length, max: MAX_BLOCKS }) }}
      </span>
    </div>

    <BaseModal
      :open="pendingRemoveId !== null"
      :title="t('modal.removeTitle')"
      @close="pendingRemoveId = null"
    >
      <p>{{ removeText }}</p>
      <template #actions>
        <button type="button" class="px-btn px-btn--ghost" @click="pendingRemoveId = null">
          {{ t('modal.cancel') }}
        </button>
        <button type="button" class="px-btn px-btn--danger" @click="confirmRemove">
          {{ t('modal.confirm') }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.home__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.home__add {
  min-height: 52px;
  padding: 8px 24px;
  font-size: 22px;
}

.home__plus {
  font-family: var(--font-display);
  font-size: 18px;
}

.home__counter {
  color: var(--c-muted);
  font-weight: 600;
}
</style>
