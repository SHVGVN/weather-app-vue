const PAPER_MAX_WIDTH = 150
const PAPER_MAX_HEIGHT = 190
const SHREDDER_WIDTH = 200
const SHREDDER_HEIGHT = 28
const SHREDDER_BOTTOM = 80
const SLOT_OFFSET = 14
const SHREDDER_LIFETIME = 2700

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function createShredder() {
  const shredder = document.createElement('div')
  shredder.className = 'shredder'
  shredder.setAttribute('aria-hidden', 'true')
  shredder.style.width = `${SHREDDER_WIDTH}px`
  shredder.style.height = `${SHREDDER_HEIGHT}px`
  shredder.style.bottom = `${SHREDDER_BOTTOM}px`
  document.body.append(shredder)
  setTimeout(() => shredder.remove(), SHREDDER_LIFETIME)
}

export function shredLeavingElement(element: Element): void {
  if (!(element instanceof HTMLElement)) return

  const rect = element.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight
  const scale = Math.min(1, PAPER_MAX_WIDTH / rect.width, PAPER_MAX_HEIGHT / rect.height)
  const paperHeight = rect.height * scale
  const slotY = viewportHeight - SHREDDER_BOTTOM - SHREDDER_HEIGHT + SLOT_OFFSET
  const targetLeft = viewportWidth / 2 - (rect.width * scale) / 2
  const targetTop = slotY - paperHeight

  Object.assign(element.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    right: 'auto',
    width: `${rect.width}px`,
  })
  element.style.setProperty('--shred-x', `${targetLeft - rect.left}px`)
  element.style.setProperty('--shred-y', `${targetTop - rect.top}px`)
  element.style.setProperty('--shred-feed', `${paperHeight}px`)
  element.style.setProperty('--shred-scale', scale.toFixed(4))

  if (!prefersReducedMotion()) createShredder()
}
