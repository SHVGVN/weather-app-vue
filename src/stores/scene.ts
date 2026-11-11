import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SceneCondition } from '@/utils/scene'

export const useSceneStore = defineStore('scene', () => {
  const condition = ref<SceneCondition>('partly')

  function setCondition(value: SceneCondition) {
    condition.value = value
  }

  return { condition, setCondition }
})
