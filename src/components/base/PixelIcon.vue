<script setup lang="ts">
import { computed } from 'vue'
import { getPixelArt, type IconName } from '@/utils/pixelIcons'

const props = withDefaults(defineProps<{ name: IconName; scale?: number }>(), { scale: 3 })

const art = computed(() => getPixelArt(props.name))
</script>

<template>
  <svg
    class="pixel-icon"
    :viewBox="`0 0 ${art.width} ${art.height}`"
    :width="art.width * scale"
    :height="art.height * scale"
    shape-rendering="crispEdges"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      v-for="(run, index) in art.runs"
      :key="index"
      :x="run.x"
      :y="run.y"
      :width="run.width"
      height="1"
      :fill="run.fill"
    />
  </svg>
</template>

<style scoped>
.pixel-icon {
  flex-shrink: 0;
  image-rendering: pixelated;
}
</style>
