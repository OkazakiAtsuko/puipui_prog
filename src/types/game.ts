// ===== 基礎的な型 =====

export type Direction = 'N' | 'E' | 'S' | 'W'

export const DIRECTION_VECTOR: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
}

export function turnRight(dir: Direction): Direction {
  return ({ N: 'E', E: 'S', S: 'W', W: 'N' } as const)[dir]
}

export function turnLeft(dir: Direction): Direction {
  return ({ N: 'W', W: 'S', S: 'E', E: 'N' } as const)[dir]
}

// セルの見た目(壁/川/海/枠外)。ゲームロジック上の挙動は behavior の方を見る。
export type CellVisual = 'floor' | 'wall' | 'river' | 'sea' | 'void'

// block: 通行不可、その場に留まる(壁・川と同じ扱い)
// hazard: 足を踏み入れるとラウンド終了(海・地形の外側)
export type CellBehavior = 'floor' | 'block' | 'hazard'

export function behaviorOf(visual: CellVisual): CellBehavior {
  if (visual === 'floor') return 'floor'
  if (visual === 'wall' || visual === 'river') return 'block'
  return 'hazard' // sea, void
}

// ===== 食べ物 =====

export type FoodType = 'carrot' | 'apple' | 'piman' | 'goldenCarrot'

export const FOOD_VALUE: Record<FoodType, number> = {
  carrot: 10,
  apple: 50,
  piman: 100,
  goldenCarrot: 500,
}

export const FOOD_LABEL: Record<FoodType, string> = {
  carrot: 'ニンジン',
  apple: 'リンゴ',
  piman: 'ピーマン',
  goldenCarrot: '金のニンジン',
}

export interface FoodItem {
  id: string
  type: FoodType
  x: number
  y: number
  eaten: boolean
}

// ===== 地図 =====

export interface MapDefinition {
  id: string
  name: string
  description: string
  size: number
  cells: CellVisual[][] // [y][x]
  start: { x: number; y: number; dir: Direction }
  // 枠(グリッド範囲)の外に出ようとした場合の挙動
  edgeBehavior: CellBehavior
  foodCounts: Record<FoodType, number>
}

// ===== プログラムのカード =====

export type ProcessKind =
  | 'move1'
  | 'move3'
  | 'move5'
  | 'turnRight'
  | 'turnLeft'
  | 'setVar0'
  | 'incVar1'
  | 'decVar1'
  | 'eatFood'
  | 'skipFood'

export type ConditionKind =
  | 'wallAhead'
  | 'riverAhead'
  | 'seaAhead'
  | 'varEquals'
  | 'foodContact'
  | 'carrotAhead'
  | 'appleAhead'
  | 'pimanAhead'
  | 'goldenCarrotAhead'

export interface ProcessCardNode {
  type: 'process'
  id: string
  kind: ProcessKind
}

export interface GotoCardNode {
  type: 'goto'
  id: string
  targetId: string | null
}

export interface JudgmentCardNode {
  type: 'judgment'
  id: string
  condition: ConditionKind
  varValue: number // condition が 'varEquals' の時だけ使う (0-9)
  yes: ProgramNode[]
  no: ProgramNode[]
}

export type ProgramNode = ProcessCardNode | GotoCardNode | JudgmentCardNode

export type CardKind = ProcessKind | ConditionKind | 'ifBranch' | 'goto' | 'start' | 'end'

export type CardCategory = 'terminal' | 'process' | 'judgment' | 'condition'

export interface CardDef {
  kind: CardKind
  category: CardCategory
  label: string
  cost: number
  description: string
}

// ===== ボーナスカード =====

export type BonusCardKind =
  | 'costDiscount' // コスト割引
  | 'comfortable' // 快適
  | 'bigEater' // 大食い
  | 'frugal' // 節約家
  | 'bulkBuy' // まとめ買い
  | 'advanceInvestment' // 先行投資
  | 'gourmet' // グルメ
  | 'noPickyEating' // 好き嫌いなし
  | 'simpleIsBest' // シンプルイズベスト
  | 'cartStar' // カートスター
  | 'detective' // 名探偵

export interface BonusCardDef {
  kind: BonusCardKind
  name: string
  effectText: string
  triggerText: string
}

// ===== 実行トレース(アニメーション再生用イベント) =====

export type ExecutionEvent =
  | { type: 'move'; nodeId: string; from: { x: number; y: number }; to: { x: number; y: number } }
  | { type: 'bump'; nodeId: string; at: { x: number; y: number } }
  | { type: 'turn'; nodeId: string; dir: Direction }
  | { type: 'setVar'; nodeId: string; value: number }
  | { type: 'eat'; nodeId: string; foodId: string; foodType: FoodType; points: number }
  | { type: 'skip'; nodeId: string }
  | { type: 'judge'; nodeId: string; result: boolean }
  | { type: 'goto'; nodeId: string; targetId: string }
  | { type: 'roundEnd'; reason: 'hazard' }
  | { type: 'turnEnd' }

export interface TurnTrace {
  events: ExecutionEvent[]
  foodsEaten: { foodId: string; type: FoodType }[]
  updatedFoods: FoodItem[] // 食べた/食べていない状態を反映した最新の食べ物リスト(次ターンに引き継ぐ)
  finalPosition: { x: number; y: number }
  finalDirection: Direction
  roundEnded: boolean
  visitCounts: Record<string, number> // nodeId -> 何回実行されたか(ループの周回数バッジ用)
  usedVarEqualsToMove: boolean // カートスター判定用
  avoidedWallCollision: boolean // 名探偵判定用
}

// ===== ターンの結果内訳 =====

export interface TurnResultBreakdown {
  foodPoints: number
  bonusEffects: { kind: BonusCardKind; label: string; amount: number; isPercent: boolean }[]
  finalFoodPoints: number
  programCost: number
  netScore: number
  cumulativeScore: number
  turnNumber: number
  roundEnded: boolean
  nextTurnDraftCount: number
}