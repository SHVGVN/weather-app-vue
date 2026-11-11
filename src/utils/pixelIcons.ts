export type IconName =
  | 'sun'
  | 'moon'
  | 'sun-cloud'
  | 'moon-cloud'
  | 'cloud'
  | 'clouds'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'mist'
  | 'star'
  | 'star-empty'
  | 'trash'
  | 'pin'

interface Layer {
  rows: string[]
  x?: number
  y?: number
  outline?: boolean
}

interface IconDefinition {
  width: number
  height: number
  layers: Layer[]
}

export interface PixelRun {
  x: number
  y: number
  width: number
  fill: string
}

export interface PixelArt {
  width: number
  height: number
  runs: PixelRun[]
}

const OUTLINE = '#2b2340'

const PALETTE: Record<string, string> = {
  Y: '#ffd93d',
  O: '#ff9f1c',
  W: '#ffffff',
  M: '#fff1a8',
  C: '#ffffff',
  G: '#c7d3e3',
  D: '#a3b0c6',
  E: '#76839c',
  B: '#3fa7ff',
  L: '#ffe14d',
  S: '#ffc93c',
  s: '#fff7e0',
  R: '#ff5d73',
  r: '#c9364d',
  P: '#ff6b9d',
}

const SUN_BODY = [
  '..YYYY..',
  '.YWWYYY.',
  'YWWYYYYY',
  'YWYYYYYY',
  'YYYYYYYY',
  'YYYYYYOY',
  '.YYYYOO.',
  '..YYYY..',
]

const SUN_RAYS = [
  '.......OO.......',
  '.......OO.......',
  '..O..........O..',
  '...O........O...',
  '................',
  '................',
  '................',
  'OO............OO',
  'OO............OO',
  '................',
  '................',
  '................',
  '...O........O...',
  '..O..........O..',
  '.......OO.......',
  '.......OO.......',
]

const MOON = [
  '................',
  '......MMMM......',
  '....MMMM........',
  '...MMM......W...',
  '..MMM...........',
  '..MMM...........',
  '.MMMM.....W.....',
  '.MMMM...........',
  '.MMMM...........',
  '.MMMMM..........',
  '..MMMMM.......M.',
  '..MMMMMMM...MM..',
  '...MMMMMMMMMMM..',
  '....MMMMMMMMM...',
  '......MMMMM.....',
  '................',
]

const SMALL_MOON = [
  '...MMM....',
  '..MM......',
  '.MM.......',
  '.MM.......',
  '.MMM......',
  '.MMMM...M.',
  '..MMMMMMM.',
  '...MMMMM..',
]

const SMALL_CLOUD = [
  '....CCC.....',
  '..CCCCCCC...',
  '.CCCCCCCCCC.',
  'CCCCCCCCCCCC',
  'CCCCCCCCCCCC',
  'GGGGGGGGGGGG',
  '.GGGGGGGGGG.',
]

const BIG_CLOUD = [
  '......CCCC......',
  '.....CCCCCC.....',
  '...CCCCCCCCC....',
  '..CCCCCCCCCCCC..',
  '.CCCCCCCCCCCCCC.',
  '.CCCCCCCCCCCCCC.',
  '.GGGGGGGGGGGGGG.',
  '..GGGGGGGGGGGG..',
]

const DROPS = [
  '...B....B....B..',
  '..B....B....B...',
  '................',
  '.....B....B.....',
  '....B....B......',
]

const FLAKES = ['..W.....W.....W.', '.WWW...WWW...WWW', '..W.....W.....W.']

const BOLT = ['..LLL.', '.LLL..', 'LLLLLL', '..LL..', '.LL...', '.L....']

const MIST = [
  '................',
  '................',
  '..CCCCCCCCCC....',
  '..GGGGGGGGGG....',
  '................',
  '................',
  '................',
  '....CCCCCCCCCCC.',
  '....GGGGGGGGGGG.',
  '................',
  '................',
  '................',
  '.CCCCCCCCCCC....',
  '.GGGGGGGGGGG....',
  '................',
  '................',
]

const STAR = [
  '....S....',
  '...SSS...',
  'SSSSSSSSS',
  '.SSSSSSS.',
  '..SSSSS..',
  '..SSSSS..',
  '.SS...SS.',
  'SS.....SS',
]

const TRASH = [
  '...RRR...',
  'RRRRRRRRR',
  '.........',
  '.RRRRRRR.',
  '.RrRrRrR.',
  '.RrRrRrR.',
  '.RrRrRrR.',
  '.RRRRRRR.',
]

const PIN = ['..PPPP..', '.PWPPPP.', 'PWP..PPP', 'PPP..PPP', '.PPPPPP.', '..PPPP..', '...PP...']

const darken = (rows: string[]) => rows.map((row) => row.replace(/C/g, 'D').replace(/G/g, 'E'))
const recolor = (rows: string[], from: string, to: string) =>
  rows.map((row) => row.split(from).join(to))

const ICONS: Record<IconName, IconDefinition> = {
  sun: {
    width: 16,
    height: 16,
    layers: [
      { rows: SUN_RAYS, outline: false },
      { rows: SUN_BODY, x: 4, y: 4 },
    ],
  },
  moon: { width: 16, height: 16, layers: [{ rows: MOON }] },
  'sun-cloud': {
    width: 16,
    height: 16,
    layers: [
      { rows: SUN_BODY, x: 7, y: 1 },
      { rows: SMALL_CLOUD, x: 1, y: 8 },
    ],
  },
  'moon-cloud': {
    width: 16,
    height: 16,
    layers: [
      { rows: SMALL_MOON, x: 5, y: 1 },
      { rows: SMALL_CLOUD, x: 1, y: 8 },
    ],
  },
  cloud: { width: 16, height: 16, layers: [{ rows: BIG_CLOUD, y: 4 }] },
  clouds: {
    width: 16,
    height: 16,
    layers: [
      { rows: darken(SMALL_CLOUD), x: 3, y: 1 },
      { rows: BIG_CLOUD, y: 6 },
    ],
  },
  rain: {
    width: 16,
    height: 16,
    layers: [
      { rows: darken(BIG_CLOUD), y: 1 },
      { rows: DROPS, y: 11 },
    ],
  },
  storm: {
    width: 16,
    height: 16,
    layers: [
      { rows: darken(BIG_CLOUD), y: 1 },
      { rows: BOLT, x: 6, y: 9 },
    ],
  },
  snow: {
    width: 16,
    height: 16,
    layers: [
      { rows: BIG_CLOUD, y: 1 },
      { rows: FLAKES, y: 12 },
    ],
  },
  mist: { width: 16, height: 16, layers: [{ rows: MIST }] },
  star: { width: 11, height: 10, layers: [{ rows: STAR, x: 1, y: 1 }] },
  'star-empty': { width: 11, height: 10, layers: [{ rows: recolor(STAR, 'S', 's'), x: 1, y: 1 }] },
  trash: { width: 11, height: 10, layers: [{ rows: TRASH, x: 1, y: 1 }] },
  pin: { width: 10, height: 10, layers: [{ rows: PIN, x: 1, y: 1 }] },
}

const NEIGHBOURS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

function compose(definition: IconDefinition): PixelArt {
  const { width, height } = definition
  const grid: (string | null)[][] = Array.from({ length: height }, () =>
    Array<string | null>(width).fill(null),
  )
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height

  definition.layers.forEach(({ rows, x: offsetX = 0, y: offsetY = 0, outline = true }) => {
    const pixels: { x: number; y: number; fill: string }[] = []
    rows.forEach((row, rowIndex) => {
      ;[...row].forEach((char, columnIndex) => {
        const fill = PALETTE[char]
        if (fill) pixels.push({ x: columnIndex + offsetX, y: rowIndex + offsetY, fill })
      })
    })

    if (outline) {
      const occupied = new Set(pixels.map(({ x, y }) => `${x},${y}`))
      pixels.forEach(({ x, y }) => {
        NEIGHBOURS.forEach(([dx, dy]) => {
          const nx = x + dx
          const ny = y + dy
          if (inside(nx, ny) && !occupied.has(`${nx},${ny}`)) grid[ny]![nx] = OUTLINE
        })
      })
    }

    pixels.forEach(({ x, y, fill }) => {
      if (inside(x, y)) grid[y]![x] = fill
    })
  })

  const runs: PixelRun[] = []
  grid.forEach((row, y) => {
    let start = 0
    row.forEach((fill, x) => {
      const next = row[x + 1]
      if (fill && next !== fill) {
        runs.push({ x: start, y, width: x - start + 1, fill })
      }
      if (next !== fill) start = x + 1
    })
  })

  return { width, height, runs }
}

const cache = new Map<IconName, PixelArt>()

export function getPixelArt(name: IconName): PixelArt {
  let art = cache.get(name)
  if (!art) {
    art = compose(ICONS[name])
    cache.set(name, art)
  }
  return art
}

export function iconFromCode(code: string): IconName {
  const night = code.endsWith('n')
  switch (code.slice(0, 2)) {
    case '01':
      return night ? 'moon' : 'sun'
    case '02':
      return night ? 'moon-cloud' : 'sun-cloud'
    case '03':
      return 'cloud'
    case '04':
      return 'clouds'
    case '09':
    case '10':
      return 'rain'
    case '11':
      return 'storm'
    case '13':
      return 'snow'
    case '50':
      return 'mist'
    default:
      return 'cloud'
  }
}
