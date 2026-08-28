import { DIRECTION_VECTOR, FOOD_VALUE, turnLeft, turnRight } from '../types/game'
import type { Direction, ExecutionEvent, FoodItem, JudgmentCardNode, MapDefinition, ProgramNode, TurnTrace } from '../types/game'
import { locate, locateContainer } from './programUtils'

const MAX_STEPS = 800

interface Ctx {
  map: MapDefinition
  x: number
  y: number
  dir: Direction
  variable: number
  foods: FoodItem[]
  events: ExecutionEvent[]
  visitCounts: Record<string, number>
  foodsEatenThisTurn: { foodId: string; type: FoodItem['type'] }[]
  roundEnded: boolean
  usedVarEqualsToMove: boolean
  avoidedWallCollision: boolean
}

interface Frame {
  containerId: string
  nodes: ProgramNode[]
  index: number
  fromVarEquals?: boolean
  fromWallAheadTrue?: boolean
  hadBump?: boolean
}

function aheadInfo(map: MapDefinition, x: number, y: number) {
  if (x < 0 || y < 0 || x >= map.size || y >= map.size) {
    return { outOfBounds: true as const, visual: null }
  }
  return { outOfBounds: false as const, visual: map.cells[y][x] }
}

function isHazardCell(map: MapDefinition, x: number, y: number): boolean {
  const info = aheadInfo(map, x, y)
  if (info.outOfBounds) return map.edgeBehavior === 'hazard'
  return info.visual === 'sea' || info.visual === 'void'
}

function isBlockedCell(map: MapDefinition, x: number, y: number): boolean {
  const info = aheadInfo(map, x, y)
  if (info.outOfBounds) return map.edgeBehavior === 'block'
  return info.visual === 'wall' || info.visual === 'river'
}

function moveForward(ctx: Ctx, steps: number, nodeId: string, stack: Frame[]) {
  for (let i = 0; i < steps; i++) {
    const { dx, dy } = DIRECTION_VECTOR[ctx.dir]
    const nx = ctx.x + dx
    const ny = ctx.y + dy
    if (isHazardCell(ctx.map, nx, ny)) {
      ctx.events.push({ type: 'move', nodeId, from: { x: ctx.x, y: ctx.y }, to: { x: nx, y: ny } })
      ctx.x = nx
      ctx.y = ny
      ctx.roundEnded = true
      return
    }
    if (isBlockedCell(ctx.map, nx, ny)) {
      ctx.events.push({ type: 'bump', nodeId, at: { x: ctx.x, y: ctx.y } })
      for (const f of stack) if (f.fromWallAheadTrue) f.hadBump = true
      return
    }
    ctx.events.push({ type: 'move', nodeId, from: { x: ctx.x, y: ctx.y }, to: { x: nx, y: ny } })
    ctx.x = nx
    ctx.y = ny
    if (stack.some((f) => f.fromVarEquals)) ctx.usedVarEqualsToMove = true
  }
}

function evaluateCondition(node: JudgmentCardNode, ctx: Ctx): boolean {
  const { dx, dy } = DIRECTION_VECTOR[ctx.dir]
  const ax = ctx.x + dx
  const ay = ctx.y + dy
  switch (node.condition) {
    case 'wallAhead':
      return isBlockedCellVisual(ctx.map, ax, ay, 'wall')
    case 'riverAhead':
      return isBlockedCellVisual(ctx.map, ax, ay, 'river')
    case 'seaAhead':
      return isHazardCell(ctx.map, ax, ay)
    case 'varEquals':
      return ctx.variable === node.varValue
    case 'foodContact':
      return ctx.foods.some((f) => !f.eaten && f.x === ctx.x && f.y === ctx.y)
    case 'carrotAhead':
      return ctx.foods.some((f) => !f.eaten && f.x === ctx.x && f.y === ctx.y && f.type === 'carrot')
    case 'appleAhead':
      return ctx.foods.some((f) => !f.eaten && f.x === ctx.x && f.y === ctx.y && f.type === 'apple')
    case 'pimanAhead':
      return ctx.foods.some((f) => !f.eaten && f.x === ctx.x && f.y === ctx.y && f.type === 'piman')
    case 'goldenCarrotAhead':
      return ctx.foods.some((f) => !f.eaten && f.x === ctx.x && f.y === ctx.y && f.type === 'goldenCarrot')
    default:
      return false
  }
}

function isBlockedCellVisual(map: MapDefinition, x: number, y: number, visual: 'wall' | 'river'): boolean {
  const info = aheadInfo(map, x, y)
  if (info.outOfBounds) {
    // 壁扱いの地図では、枠の外も「壁がある」とみなす。川判定は枠外には該当しない。
    return visual === 'wall' && map.edgeBehavior === 'block'
  }
  return info.visual === visual
}

export function runTurn(map: MapDefinition, foods: FoodItem[], start: { x: number; y: number; dir: Direction }, program: ProgramNode[]): TurnTrace {
  const ctx: Ctx = {
    map,
    x: start.x,
    y: start.y,
    dir: start.dir,
    variable: 0,
    foods: foods.map((f) => ({ ...f })),
    events: [],
    visitCounts: {},
    foodsEatenThisTurn: [],
    roundEnded: false,
    usedVarEqualsToMove: false,
    avoidedWallCollision: false,
  }

  const stack: Frame[] = [{ containerId: 'root', nodes: program, index: 0 }]
  let steps = 0

  while (stack.length > 0) {
    const frame = stack[stack.length - 1]
    if (frame.index >= frame.nodes.length) {
      if (frame.fromWallAheadTrue && !frame.hadBump) ctx.avoidedWallCollision = true
      stack.pop()
      continue
    }
    if (steps++ > MAX_STEPS) break
    if (ctx.roundEnded) break

    const node = frame.nodes[frame.index]
    ctx.visitCounts[node.id] = (ctx.visitCounts[node.id] || 0) + 1

    if (node.type === 'process') {
      frame.index++
      switch (node.kind) {
        case 'move1':
          moveForward(ctx, 1, node.id, stack)
          break
        case 'move3':
          moveForward(ctx, 3, node.id, stack)
          break
        case 'move5':
          moveForward(ctx, 5, node.id, stack)
          break
        case 'turnRight':
          ctx.dir = turnRight(ctx.dir)
          ctx.events.push({ type: 'turn', nodeId: node.id, dir: ctx.dir })
          break
        case 'turnLeft':
          ctx.dir = turnLeft(ctx.dir)
          ctx.events.push({ type: 'turn', nodeId: node.id, dir: ctx.dir })
          break
        case 'setVar0':
          ctx.variable = 0
          ctx.events.push({ type: 'setVar', nodeId: node.id, value: ctx.variable })
          break
        case 'incVar1':
          ctx.variable += 1
          ctx.events.push({ type: 'setVar', nodeId: node.id, value: ctx.variable })
          break
        case 'decVar1':
          ctx.variable -= 1
          ctx.events.push({ type: 'setVar', nodeId: node.id, value: ctx.variable })
          break
        case 'eatFood': {
          const food = ctx.foods.find((f) => !f.eaten && f.x === ctx.x && f.y === ctx.y)
          if (food) {
            food.eaten = true
            const points = FOOD_VALUE[food.type]
            ctx.foodsEatenThisTurn.push({ foodId: food.id, type: food.type })
            ctx.events.push({ type: 'eat', nodeId: node.id, foodId: food.id, foodType: food.type, points })
          } else {
            ctx.events.push({ type: 'skip', nodeId: node.id })
          }
          break
        }
        case 'skipFood':
          ctx.events.push({ type: 'skip', nodeId: node.id })
          break
      }
      if (ctx.roundEnded) {
        ctx.events.push({ type: 'roundEnd', reason: 'hazard' })
        break
      }
      continue
    }

    if (node.type === 'judgment') {
      frame.index++
      const result = evaluateCondition(node, ctx)
      ctx.events.push({ type: 'judge', nodeId: node.id, result })
      const lane = result ? node.yes : node.no
      const laneContainerId = `${node.id}:${result ? 'yes' : 'no'}`
      const laneFrame: Frame = { containerId: laneContainerId, nodes: lane, index: 0 }
      if (node.condition === 'varEquals') laneFrame.fromVarEquals = true
      if (node.condition === 'wallAhead' && result === true) laneFrame.fromWallAheadTrue = true
      stack.push(laneFrame)
      continue
    }

    if (node.type === 'goto') {
      frame.index++
      if (node.targetId) {
        const loc = locate(program, node.targetId)
        if (loc) {
          ctx.events.push({ type: 'goto', nodeId: node.id, targetId: node.targetId })
          while (stack.length && stack[stack.length - 1].containerId !== loc.containerId) {
            const popped = stack.pop()
            if (popped?.fromWallAheadTrue && !popped.hadBump) ctx.avoidedWallCollision = true
          }
          if (stack.length) {
            stack[stack.length - 1].index = loc.index
          } else {
            const nodes = locateContainer(program, loc.containerId) ?? []
            stack.push({ containerId: loc.containerId, nodes, index: loc.index })
          }
        }
      }
      continue
    }
  }

  if (!ctx.roundEnded) ctx.events.push({ type: 'turnEnd' })

  return {
    events: ctx.events,
    foodsEaten: ctx.foodsEatenThisTurn,
    updatedFoods: ctx.foods,
    finalPosition: { x: ctx.x, y: ctx.y },
    finalDirection: ctx.dir,
    roundEnded: ctx.roundEnded,
    visitCounts: ctx.visitCounts,
    usedVarEqualsToMove: ctx.usedVarEqualsToMove,
    avoidedWallCollision: ctx.avoidedWallCollision,
  }
}