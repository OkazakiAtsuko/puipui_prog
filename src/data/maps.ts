import type { CellVisual, FoodItem, FoodType, MapDefinition } from '../types/game'

function emptyGrid(size: number, fill: CellVisual = 'floor'): CellVisual[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill))
}

function buildSmallRoom(): MapDefinition {
  const size = 5
  return {
    id: 'smallRoom',
    name: '小さな部屋',
    description: '5x5の何もない部屋。基本の動きを試すのに向いています。',
    size,
    cells: emptyGrid(size),
    start: { x: 0, y: 2, dir: 'E' },
    edgeBehavior: 'block',
    foodCounts: { carrot: 3, apple: 2, piman:1, goldenCarrot: 1 },
  }
}

function buildBigRoom(): MapDefinition {
  const size = 10
  return {
    id: 'bigRoom',
    name: '大きな部屋',
    description: '10x10の広い部屋。',
    size,
    cells: emptyGrid(size),
    start: { x: 0, y: 5, dir: 'E' },
    edgeBehavior: 'block',
    foodCounts: { carrot: 6, apple: 4, piman:2, goldenCarrot: 1 },
  }
}

function buildRiverPlain(): MapDefinition {
  const size = 10
  const cells = emptyGrid(size)
  const riverCol = 4
  for (let y = 1; y < size - 1; y++) {
    cells[y][riverCol] = 'river'
  }
  return {
    id: 'riverPlain',
    name: '川が流れている平原',
    description: '川が中央を流れており、渡れないので歩いて迂回する必要があります。',
    size,
    cells,
    start: { x: 0, y: 5, dir: 'E' },
    edgeBehavior: 'block',
    foodCounts: { carrot: 6, apple: 4, piman:2, goldenCarrot: 1 },
  }
}

function buildIsland(): MapDefinition {
  const size = 15
  return {
    id: 'island',
    name: '島',
    description: '周囲を海に囲まれた島。壁がないので、端を越えるとラウンドが終了します。',
    size,
    cells: emptyGrid(size),
    start: { x: 7, y: 7, dir: 'E' },
    edgeBehavior: 'hazard',
    foodCounts: { carrot: 8, apple: 5, piman:3, goldenCarrot: 2 },
  }
}

function buildComplexShape(): MapDefinition {
  const size = 20
  const cells = emptyGrid(size, 'void')
  const cx = size / 2 - 0.5
  const cy = size / 2 - 0.5
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const angle = Math.atan2(dy, dx)
      const radius = Math.sqrt(dx * dx + dy * dy)
      const bulge = 8.5 + 2.2 * Math.cos(angle * 3) + 1.2 * Math.sin(angle * 5)
      if (radius <= bulge) {
        cells[y][x] = 'floor'
      }
    }
  }
  return {
    id: 'complexShape',
    name: '複雑な地形',
    description: '帆立のように波打った複雑な形の地形。地形の外側に出るとラウンドが終了します。',
    size,
    cells,
    start: { x: Math.round(cx), y: Math.round(cy), dir: 'E' },
    edgeBehavior: 'hazard',
    foodCounts: { carrot: 10, apple: 6, piman:4, goldenCarrot: 2 },
  }
}

export const MAP_DEFINITIONS: MapDefinition[] = [
  buildSmallRoom(),
  buildBigRoom(),
  buildRiverPlain(),
  buildIsland(),
  buildComplexShape(),
]

// 難易度は地図の複雑さの順(MAP_DEFINITIONSの並び)にそのまま対応させる。
export const DIFFICULTY_LABELS: Record<string, string> = {
  smallRoom: '超簡単',
  bigRoom: '簡単',
  riverPlain: '普通',
  island: '難しい',
  complexShape: '超難しい',
}

export function placeFoods(map: MapDefinition): FoodItem[] {
  const candidates: { x: number; y: number }[] = []
  for (let y = 0; y < map.size; y++) {
    for (let x = 0; x < map.size; x++) {
      if (map.cells[y][x] === 'floor' && !(x === map.start.x && y === map.start.y)) {
        candidates.push({ x, y })
      }
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const foods: FoodItem[] = []
  let cursor = 0
  let counter = 0
  const types: FoodType[] = ['carrot', 'apple', 'piman', 'goldenCarrot']
  for (const type of types) {
    const count = map.foodCounts[type]
    for (let i = 0; i < count && cursor < candidates.length; i++) {
      const spot = candidates[cursor++]
      foods.push({ id: `food-${counter++}`, type, x: spot.x, y: spot.y, eaten: false })
    }
  }
  return foods
}