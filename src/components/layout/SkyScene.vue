<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PixelIcon from '@/components/base/PixelIcon.vue'
import { useSceneStore } from '@/stores/scene'
import { useSettingsStore } from '@/stores/settings'
import type { IconName } from '@/utils/pixelIcons'
import type { SceneCondition } from '@/utils/scene'

const settings = useSettingsStore()
const scene = useSceneStore()

const initialTurns = settings.theme === 'day' ? 0 : 1
const turns = ref(initialTurns)

watch(
  () => settings.theme,
  () => {
    turns.value += 1
  },
)

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}

function starField(count: number, seed: number, maxHeight = 85): string {
  const random = seededRandom(seed)
  return Array.from(
    { length: count },
    () =>
      `${between(random, 0, 100).toFixed(2)}vw ${between(random, 0, maxHeight).toFixed(2)}vh 0 0 currentColor`,
  ).join(', ')
}

function fallingField(count: number, seed: number): string {
  const random = seededRandom(seed)
  return Array.from({ length: count }, () => {
    const x = between(random, 0, 100).toFixed(2)
    const y = between(random, 0, 100)
    return `${x}vw ${y.toFixed(2)}vh 0 0 currentColor, ${x}vw ${(y - 100).toFixed(2)}vh 0 0 currentColor`
  }).join(', ')
}

const farStars = starField(110, 31)
const midStars = starField(60, 97)
const brightStars = starField(22, 7, 60)

const nearDrops = fallingField(70, 401)
const farDrops = fallingField(90, 433)
const nearFlakes = fallingField(55, 467)
const farFlakes = fallingField(80, 499)

const sparkleRandom = seededRandom(211)
const sparkles = Array.from({ length: 9 }, (_, index) => ({
  left: `${between(sparkleRandom, 4, 96).toFixed(1)}%`,
  top: `${between(sparkleRandom, 3, 65).toFixed(1)}%`,
  delay: `${(index * 0.7).toFixed(1)}s`,
  duration: `${between(sparkleRandom, 2.4, 4.2).toFixed(1)}s`,
}))

const shootingStars = [
  { left: '78%', top: '6%', delay: '1s', duration: '9s' },
  { left: '52%', top: '14%', delay: '5.5s', duration: '13s' },
  { left: '96%', top: '30%', delay: '9s', duration: '17s' },
]

const CLOUD_COUNT: Record<SceneCondition, number> = {
  clear: 3,
  partly: 6,
  cloudy: 10,
  overcast: 16,
  rain: 16,
  storm: 16,
  snow: 11,
  mist: 5,
}

const cloudRandom = seededRandom(53)
const clouds = Array.from({ length: 16 }, (_, rank) => {
  const scale = Math.round(between(cloudRandom, 2, 7))
  const duration = between(cloudRandom, 70, 170) * (8 / (scale + 4))
  return {
    rank,
    icon: (rank % 3 === 2 ? 'clouds' : 'cloud') as IconName,
    scale,
    top: `${between(cloudRandom, 22, 92).toFixed(1)}%`,
    duration: `${duration.toFixed(0)}s`,
    delay: `-${between(cloudRandom, 0, duration).toFixed(0)}s`,
    opacity: (0.55 + scale * 0.065).toFixed(2),
  }
}).sort((a, b) => a.scale - b.scale)

const fogRandom = seededRandom(613)
const fogBands = Array.from({ length: 9 }, () => {
  const duration = between(fogRandom, 45, 110)
  return {
    top: `${between(fogRandom, 18, 94).toFixed(1)}%`,
    width: `${between(fogRandom, 30, 70).toFixed(0)}vw`,
    height: `${Math.round(between(fogRandom, 3, 7)) * 4}px`,
    duration: `${duration.toFixed(0)}s`,
    delay: `-${between(fogRandom, 0, duration).toFixed(0)}s`,
  }
})

const condition = computed(() => scene.condition)
const visibleClouds = computed(() => CLOUD_COUNT[condition.value])
const hasRain = computed(() => condition.value === 'rain' || condition.value === 'storm')
const hasStorm = computed(() => condition.value === 'storm')
const hasSnow = computed(() => condition.value === 'snow')
const hasFog = computed(() => condition.value === 'mist')
</script>

<template>
  <div
    class="sky"
    :class="[`sky--${settings.theme}`, `sky--w-${condition}`]"
    :style="{ '--turns': turns }"
    aria-hidden="true"
  >
    <div class="sky__layer sky__layer--night" />
    <div class="sky__layer sky__layer--day" />
    <div :key="turns" class="sky__dusk" :class="{ 'is-animated': turns !== initialTurns }" />

    <div class="sky__night">
      <div class="sky__stars sky__stars--far" :style="{ boxShadow: farStars }" />
      <div class="sky__stars sky__stars--mid" :style="{ boxShadow: midStars }" />
      <div class="sky__stars sky__stars--bright" :style="{ boxShadow: brightStars }" />
      <span
        v-for="(sparkle, index) in sparkles"
        :key="`sparkle-${index}`"
        class="sky__sparkle"
        :style="{
          left: sparkle.left,
          top: sparkle.top,
          animationDelay: sparkle.delay,
          animationDuration: sparkle.duration,
        }"
      />
      <span
        v-for="(star, index) in shootingStars"
        :key="`shooting-${index}`"
        class="sky__shooting"
        :style="{
          left: star.left,
          top: star.top,
          animationDelay: star.delay,
          animationDuration: star.duration,
        }"
      />
    </div>

    <div class="sky__orbit">
      <div class="sky__body sky__body--sun">
        <span class="sky__halo" />
        <PixelIcon name="sun" :scale="7" />
      </div>
      <div class="sky__body sky__body--moon">
        <span class="sky__halo sky__halo--moon" />
        <PixelIcon name="moon" :scale="6" />
      </div>
    </div>

    <div class="sky__tint" />

    <div
      v-for="cloud in clouds"
      :key="`cloud-${cloud.rank}`"
      class="sky__cloud"
      :class="{ 'is-visible': cloud.rank < visibleClouds }"
      :style="{
        top: cloud.top,
        '--cloud-opacity': cloud.opacity,
        animationDuration: cloud.duration,
        animationDelay: cloud.delay,
      }"
    >
      <PixelIcon :name="cloud.icon" :scale="cloud.scale" />
    </div>

    <Transition name="sky-fade">
      <div v-if="hasFog" class="sky__weather">
        <span
          v-for="(band, index) in fogBands"
          :key="`fog-${index}`"
          class="sky__fog"
          :style="{
            top: band.top,
            width: band.width,
            height: band.height,
            animationDuration: band.duration,
            animationDelay: band.delay,
          }"
        />
      </div>
    </Transition>

    <Transition name="sky-fade">
      <div v-if="hasRain" class="sky__weather">
        <div class="sky__fall sky__fall--far-drops" :style="{ boxShadow: farDrops }" />
        <div class="sky__fall sky__fall--near-drops" :style="{ boxShadow: nearDrops }" />
      </div>
    </Transition>

    <Transition name="sky-fade">
      <div v-if="hasSnow" class="sky__weather">
        <div class="sky__fall sky__fall--far-flakes" :style="{ boxShadow: farFlakes }" />
        <div class="sky__fall sky__fall--near-flakes" :style="{ boxShadow: nearFlakes }" />
      </div>
    </Transition>

    <Transition name="sky-fade">
      <div v-if="hasStorm" class="sky__flash" />
    </Transition>
  </div>
</template>

<style scoped>
.sky {
  --orbit-easing: cubic-bezier(0.65, 0, 0.35, 1);
  --weather-duration: 1.6s;
  --tint-opacity: 0;
  --tint-day: #8592a8;
  --tint-night: #0b0a18;
  --halo-opacity: 0.5;
  --cloud-brightness: 1;
  --night-cloud: 0.2;

  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  color: #ffffff;
}

.sky--w-clear {
  --halo-opacity: 1;
}

.sky--w-partly {
  --halo-opacity: 0.55;
}

.sky--w-cloudy {
  --tint-opacity: 0.22;
  --halo-opacity: 0.2;
  --night-cloud: 0.3;
}

.sky--w-overcast {
  --tint-opacity: 0.45;
  --halo-opacity: 0;
  --cloud-brightness: 0.88;
  --night-cloud: 0.4;
}

.sky--w-rain {
  --tint-opacity: 0.55;
  --halo-opacity: 0;
  --cloud-brightness: 0.72;
  --night-cloud: 0.45;
}

.sky--w-storm {
  --tint-opacity: 0.68;
  --tint-day: #4a4f66;
  --halo-opacity: 0;
  --cloud-brightness: 0.55;
  --night-cloud: 0.5;
}

.sky--w-snow {
  --tint-opacity: 0.4;
  --tint-day: #e6ecf3;
  --tint-night: #4a5070;
  --halo-opacity: 0;
  --night-cloud: 0.4;
}

.sky--w-mist {
  --tint-opacity: 0.45;
  --tint-day: #e6ecf3;
  --tint-night: #3a3f58;
  --halo-opacity: 0.15;
  --night-cloud: 0.25;
}

.sky__layer,
.sky__dusk,
.sky__night,
.sky__tint,
.sky__weather,
.sky__flash {
  position: absolute;
  inset: 0;
}

.sky__layer {
  transition: opacity var(--theme-duration) ease-in-out;
}

.sky__layer--day {
  background: linear-gradient(
    180deg,
    #7cc8ff 0 18%,
    #95d4ff 18% 36%,
    #afe0ff 36% 54%,
    #c9ebff 54% 72%,
    #e2f5ff 72% 100%
  );
}

.sky__layer--night {
  background: linear-gradient(
    180deg,
    #0d0b26 0 18%,
    #141139 18% 36%,
    #1c184b 36% 54%,
    #25205d 54% 72%,
    #2f296f 72% 100%
  );
}

.sky--night .sky__layer--day {
  opacity: 0;
}

.sky__dusk {
  opacity: 0;
  background: linear-gradient(
    180deg,
    transparent 0 45%,
    rgba(255, 183, 107, 0.45) 45% 60%,
    rgba(255, 145, 107, 0.7) 60% 75%,
    rgba(255, 107, 157, 0.85) 75% 100%
  );
}

.sky__dusk.is-animated {
  animation: dusk var(--theme-duration) ease-in-out;
}

.sky__night {
  opacity: 0;
  transition: opacity var(--theme-duration) ease-in-out;
}

.sky--night .sky__night {
  opacity: 1;
}

.sky__tint {
  background-color: var(--tint-day);
  opacity: var(--tint-opacity);
  transition:
    opacity var(--weather-duration) ease,
    background-color var(--theme-duration) ease;
}

.sky--night .sky__tint {
  background-color: var(--tint-night);
}

.sky__stars {
  position: absolute;
  top: 0;
  left: 0;
}

.sky__stars--far {
  width: 2px;
  height: 2px;
  color: #a9a2e6;
  animation: twinkle 4.6s steps(2, jump-none) infinite;
}

.sky__stars--mid {
  width: 3px;
  height: 3px;
  color: #e6e1ff;
  animation: twinkle 3.1s steps(2, jump-none) 1.2s infinite;
}

.sky__stars--bright {
  width: 4px;
  height: 4px;
  color: #fff6c8;
}

.sky__sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffffff;
  box-shadow:
    4px 0 0 0 #fff6c8,
    -4px 0 0 0 #fff6c8,
    0 4px 0 0 #fff6c8,
    0 -4px 0 0 #fff6c8,
    8px 0 0 0 rgba(255, 246, 200, 0.5),
    -8px 0 0 0 rgba(255, 246, 200, 0.5),
    0 8px 0 0 rgba(255, 246, 200, 0.5),
    0 -8px 0 0 rgba(255, 246, 200, 0.5);
  animation: sparkle 3s steps(3, jump-none) infinite;
}

.sky__shooting {
  position: absolute;
  width: 110px;
  height: 3px;
  opacity: 0;
  background: linear-gradient(
    90deg,
    #ffffff 0 6px,
    rgba(255, 246, 200, 0.75) 6px 30%,
    rgba(255, 246, 200, 0.25) 30% 65%,
    transparent 65%
  );
  transform-origin: left center;
}

.sky--night .sky__shooting {
  animation-name: shoot;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.sky__orbit {
  position: absolute;
  top: 118%;
  left: 50%;
  width: 0;
  height: 0;
  transform: rotate(calc(var(--turns) * 180deg));
  transition: transform var(--theme-duration) var(--orbit-easing);
  will-change: transform;
}

.sky__body {
  position: absolute;
  transform: translate(-50%, -50%) rotate(calc(var(--turns) * -180deg));
  transition: transform var(--theme-duration) var(--orbit-easing);
  will-change: transform;
}

.sky__body--sun {
  top: -102vh;
  left: 34vw;
}

.sky__body--moon {
  top: 102vh;
  left: -34vw;
}

.sky__halo {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 240, 160, 0.6) 0 22%,
    rgba(255, 240, 160, 0.32) 22% 33%,
    rgba(255, 240, 160, 0.14) 33% 46%,
    transparent 46%
  );
  opacity: var(--halo-opacity);
  transform: translate(-50%, -50%);
  transition: opacity var(--weather-duration) ease;
  animation: halo-pulse 4s ease-in-out infinite alternate;
}

.sky__halo--moon {
  background: radial-gradient(
    circle,
    rgba(210, 215, 255, 0.35) 0 20%,
    rgba(210, 215, 255, 0.16) 20% 32%,
    transparent 32%
  );
}

.sky__cloud {
  position: absolute;
  left: 0;
  opacity: 0;
  filter: brightness(var(--cloud-brightness));
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  transition:
    opacity var(--weather-duration) ease-in-out,
    filter var(--weather-duration) ease-in-out;
  will-change: transform;
}

.sky__cloud.is-visible {
  opacity: var(--cloud-opacity);
}

.sky--night .sky__cloud.is-visible {
  opacity: calc(var(--cloud-opacity) * var(--night-cloud));
}

.sky__fog {
  position: absolute;
  left: 0;
  background: rgba(255, 255, 255, 0.55);
  box-shadow:
    8px 4px 0 0 rgba(255, 255, 255, 0.3),
    -8px -4px 0 0 rgba(255, 255, 255, 0.2);
  animation-name: drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.sky--night .sky__fog {
  background: rgba(200, 205, 235, 0.22);
}

.sky__fall {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.sky__fall--near-drops {
  width: 3px;
  height: 16px;
  color: rgba(170, 205, 255, 0.75);
  animation: fall 0.75s linear infinite;
}

.sky__fall--far-drops {
  width: 2px;
  height: 10px;
  color: rgba(170, 205, 255, 0.45);
  animation: fall 1.15s linear infinite;
}

.sky__fall--near-flakes {
  width: 5px;
  height: 5px;
  color: rgba(255, 255, 255, 0.95);
  animation:
    fall 11s linear infinite,
    sway 3s ease-in-out infinite alternate;
}

.sky__fall--far-flakes {
  width: 3px;
  height: 3px;
  color: rgba(255, 255, 255, 0.7);
  animation:
    fall 16s linear infinite,
    sway 4s ease-in-out infinite alternate;
}

.sky__flash {
  background: #ffffff;
  opacity: 0;
  animation: flash 7s infinite;
}

.sky-fade-enter-active,
.sky-fade-leave-active {
  transition: opacity var(--weather-duration) ease;
}

.sky-fade-enter-from,
.sky-fade-leave-to {
  opacity: 0;
}

@keyframes dusk {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shoot {
  0% {
    opacity: 0;
    transform: rotate(-24deg) translateX(0);
  }
  1% {
    opacity: 1;
  }
  7% {
    opacity: 0;
    transform: rotate(-24deg) translateX(-45vw);
  }
  100% {
    opacity: 0;
    transform: rotate(-24deg) translateX(-45vw);
  }
}

@keyframes drift {
  from {
    transform: translateX(-30vw);
  }
  to {
    transform: translateX(110vw);
  }
}

@keyframes fall {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100vh);
  }
}

@keyframes sway {
  from {
    translate: -1.5vw 0;
  }
  to {
    translate: 1.5vw 0;
  }
}

@keyframes halo-pulse {
  from {
    scale: 1;
  }
  to {
    scale: 1.08;
  }
}

@keyframes flash {
  0%,
  86%,
  100% {
    opacity: 0;
  }
  87% {
    opacity: 0.7;
  }
  88% {
    opacity: 0.1;
  }
  89.5% {
    opacity: 0.5;
  }
  91% {
    opacity: 0;
  }
}

@media (max-width: 600px) {
  .sky__body :deep(svg) {
    width: 64px;
    height: 64px;
  }

  .sky__cloud :deep(svg) {
    zoom: 0.6;
  }

  .sky__halo {
    width: 200px;
    height: 200px;
  }
}
</style>
