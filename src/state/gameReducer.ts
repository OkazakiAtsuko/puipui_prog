import { BONUS_CARD_KINDS } from '../data/bonusCards'
import { MAP_DEFINITIONS, placeFoods } from '../data/maps'
import { computeProgramCost, computeTurnResult } from '../engine/scoring'
import { runTurn } from '../engine/executor'
import type { BonusCardKind, Direction, FoodItem, MapDefinition, ProgramNode, TurnResultBreakdown, TurnTrace } from '../types/game'

export type GamePhase = 'difficultySelect' | 'bonusSelect' | 'build' | 'execute' | 'result'

export interface GameState {
  phase: GamePhase
  map: MapDefinition
  foods: FoodItem[]
  robotPos: { x: number; y: number }
  robotDir: Direction
  turnNumber: number
  totalTurns: number
  cumulativeScore: number
  ownedBonusCards: BonusCardKind[]
  currentDraft: BonusCardKind[]
  nextTurnDraftCount: number
  justPickedAdvanceInvestment: boolean
  foodsReplenished: boolean
  lastProgram: ProgramNode[] | null
  lastTrace: TurnTrace | null
  lastResult: TurnResultBreakdown | null
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SELECT_DIFFICULTY'; mapId: string }
  | { type: 'PICK_BONUS_CARD'; kind: BonusCardKind }
  | { type: 'RUN_PROGRAM'; program: ProgramNode[] }
  | { type: 'FINISH_EXECUTION' }
  | { type: 'NEXT_TURN' }

function drawDraft(count: number): BonusCardKind[] {
  const pool = [...BONUS_CARD_KINDS]
  const draft: BonusCardKind[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    draft.push(pool[idx])
    pool.splice(idx, 1)
  }
  return draft
}

export function createInitialState(): GameState {
  // 難易度選択前なので地図は仮のプレースホルダー(difficultySelect画面では使われない)。
  const map = MAP_DEFINITIONS[0]
  const foods = placeFoods(map)
  return {
    phase: 'difficultySelect',
    map,
    foods,
    robotPos: { x: map.start.x, y: map.start.y },
    robotDir: map.start.dir,
    turnNumber: 1,
    totalTurns: 5,
    cumulativeScore: 100,
    ownedBonusCards: [],
    currentDraft: [],
    nextTurnDraftCount: 3,
    justPickedAdvanceInvestment: false,
    foodsReplenished: false,
    lastProgram: null,
    lastTrace: null,
    lastResult: null,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState()

    case 'SELECT_DIFFICULTY': {
      const map = MAP_DEFINITIONS.find((m) => m.id === action.mapId) ?? MAP_DEFINITIONS[0]
      const foods = placeFoods(map)
      return {
        ...state,
        phase: 'bonusSelect',
        map,
        foods,
        robotPos: { x: map.start.x, y: map.start.y },
        robotDir: map.start.dir,
        currentDraft: drawDraft(3),
      }
    }

    case 'PICK_BONUS_CARD': {
      const isAdvanceInvestment = action.kind === 'advanceInvestment'
      return {
        ...state,
        ownedBonusCards: isAdvanceInvestment ? state.ownedBonusCards : [...state.ownedBonusCards, action.kind],
        justPickedAdvanceInvestment: isAdvanceInvestment,
        phase: 'build',
      }
    }

    case 'RUN_PROGRAM': {
      const cost = computeProgramCost(action.program, state.ownedBonusCards, state.justPickedAdvanceInvestment)
      if (cost > state.cumulativeScore) return state
      const trace = runTurn(state.map, state.foods, { ...state.robotPos, dir: state.robotDir }, action.program)
      const result = computeTurnResult({
        turnNumber: state.turnNumber,
        program: action.program,
        trace,
        ownedBonusCards: state.ownedBonusCards,
        justPickedAdvanceInvestment: state.justPickedAdvanceInvestment,
        cumulativeScoreBefore: state.cumulativeScore,
      })
      // 実行アニメーション中はまだ地図・うさぎの位置を確定させない(FINISH_EXECUTIONで確定する)。
      return {
        ...state,
        phase: 'execute',
        lastProgram: action.program,
        lastTrace: trace,
        lastResult: result,
      }
    }

    case 'FINISH_EXECUTION': {
      if (!state.lastTrace || !state.lastResult) return { ...state, phase: 'result' }
      const allEaten = state.lastTrace.updatedFoods.every((f) => f.eaten)
      // ラウンドが終わっていないのに全部食べ尽くしてしまった場合は、地図に食べ物を出し直す。
      const shouldReplenish = !state.lastTrace.roundEnded && allEaten
      const foods = shouldReplenish ? placeFoods(state.map) : state.lastTrace.updatedFoods
      return {
        ...state,
        phase: 'result',
        foods,
        foodsReplenished: shouldReplenish,
        robotPos: state.lastTrace.finalPosition,
        robotDir: state.lastTrace.finalDirection,
        cumulativeScore: state.lastResult.cumulativeScore,
      }
    }

    case 'NEXT_TURN': {
      const draftCount = state.lastResult?.nextTurnDraftCount ?? 3
      return {
        ...state,
        phase: 'bonusSelect',
        turnNumber: state.turnNumber + 1,
        currentDraft: drawDraft(draftCount),
        nextTurnDraftCount: 3,
        justPickedAdvanceInvestment: false,
      }
    }

    default:
      return state
  }
}

export function isGameOver(state: GameState): boolean {
  return state.turnNumber >= state.totalTurns || Boolean(state.lastResult?.roundEnded)
}