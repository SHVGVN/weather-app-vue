<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { useSettingsStore } from '@/stores/settings'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
)

const FONT_FAMILY = "'Tiny5', monospace"
const DATA_ANIMATION_DURATION = 350
const THEME_ANIMATION_DURATION = 1400
const DESTROY_DELAY = 2400
const NUMBER_FONT_FAMILY = "'Jersey 10', monospace"

const props = defineProps<{ labels: string[]; values: number[]; title: string; unit: string }>()

const settings = useSettingsStore()
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

interface Palette {
  line: string
  fill: string
  point: string
  grid: string
  text: string
  tooltip: string
  tooltipText: string
}

let chart: Chart<'line', number[], string> | null = null
let palette: Palette | null = null

function readPalette(element: HTMLElement): Palette {
  const styles = getComputedStyle(element)
  const read = (name: string) => styles.getPropertyValue(name).trim()
  return {
    line: read('--c-chart-line'),
    fill: read('--c-chart-fill'),
    point: read('--c-chart-point'),
    grid: read('--c-chart-grid'),
    text: read('--c-chart-text'),
    tooltip: read('--c-chart-tooltip'),
    tooltipText: read('--c-chart-tooltip-text'),
  }
}

const valueLabels: Plugin<'line'> = {
  id: 'valueLabels',
  afterDatasetsDraw(instance) {
    const { ctx } = instance
    const values = instance.data.datasets[0]?.data ?? []
    const points = instance.getDatasetMeta(0).data
    ctx.save()
    ctx.font = `20px ${NUMBER_FONT_FAMILY}`
    ctx.fillStyle = palette?.text ?? '#000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    points.forEach((point, index) => {
      const value = values[index]
      if (typeof value === 'number') ctx.fillText(`${Math.round(value)}°`, point.x, point.y - 10)
    })
    ctx.restore()
  },
}

function buildOptions(colors: Palette, duration = DATA_ANIMATION_DURATION): ChartOptions<'line'> {
  const font = { family: FONT_FAMILY, size: 14 }
  const numberFont = { family: NUMBER_FONT_FAMILY, size: 20 }
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration, easing: 'easeInOutQuad' },
    layout: { padding: { top: 28, right: 16, left: 4, bottom: 4 } },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        offset: true,
        grid: { color: colors.grid, drawTicks: false },
        border: { display: false },
        ticks: { color: colors.text, font, maxRotation: 0, autoSkipPadding: 12, padding: 10 },
      },
      y: {
        grace: '20%',
        grid: { color: colors.grid, drawTicks: false },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: colors.text,
          font: numberFont,
          padding: 10,
          maxTicksLimit: 5,
          callback: (value) => `${Math.round(Number(value))}°`,
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: colors.tooltip,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        titleFont: font,
        bodyFont: { ...numberFont, size: 24 },
        cornerRadius: 0,
        caretSize: 0,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `${Math.round(context.parsed.y ?? 0)}${props.unit}`,
        },
      },
    },
  }
}

function render(animationDuration = DATA_ANIMATION_DURATION) {
  const element = canvas.value
  if (!element) return

  palette = readPalette(element)
  const dataset = {
    data: [...props.values],
    borderColor: palette.line,
    backgroundColor: palette.fill,
    pointBackgroundColor: palette.point,
    pointBorderColor: palette.line,
    fill: true,
    tension: 0,
    borderWidth: 3,
    pointStyle: 'rect' as const,
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBorderWidth: 3,
  }

  if (chart) {
    const [current] = chart.data.datasets
    chart.data.labels = [...props.labels]
    if (current) {
      Object.assign(current, dataset)
    } else {
      chart.data.datasets = [dataset]
    }
    chart.options = buildOptions(palette, animationDuration)
    chart.update()
    return
  }

  chart = new Chart(element, {
    type: 'line',
    data: { labels: [...props.labels], datasets: [dataset] },
    options: buildOptions(palette),
    plugins: [valueLabels],
  })
}

onMounted(() => {
  render()
  document.fonts?.ready.then(() => chart?.update())
})

watch(
  () => [props.labels, props.values, props.unit],
  () => render(),
  { deep: true },
)
watch(
  () => settings.theme,
  () => nextTick(() => render(THEME_ANIMATION_DURATION)),
)

onBeforeUnmount(() => {
  const instance = chart
  chart = null
  setTimeout(() => instance?.destroy(), DESTROY_DELAY)
})
</script>

<template>
  <figure class="chart">
    <figcaption class="chart__title">{{ title }}</figcaption>
    <div class="chart__canvas">
      <canvas ref="canvas" role="img" :aria-label="title" />
    </div>
  </figure>
</template>

<style scoped>
.chart {
  margin: 0;
}

.chart__title {
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--c-muted);
}

.chart__canvas {
  position: relative;
  height: 260px;
}

@media (max-width: 600px) {
  .chart__canvas {
    height: 210px;
  }
}
</style>
