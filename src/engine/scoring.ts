import { BONUS_CARD_DEFS } from '../data/bonusCards'
import { FOOD_VALUE } from '../types/game'
import type { BonusCardKind, ProgramNode, TurnResultBreakdown, TurnTrace } from '../types/game'
import { collectDistinctKinds, countCards, isStraightLineProgram, totalProgramCost } from './programUtils'

function hasConsecutiveSameType(foodsEaten: { type: string }[]): boolean {
  for (let i = 1; i < foodsEaten.length; i++) {
    if (foodsEaten[i].type === foodsEaten[i - 1].type) return true
  }
  return false
}

function hasConsecutiveDifferentType(foodsEaten: { type: string }[]): boolean {
  for (let i = 1; i < foodsEaten.length; i++) {
    if (foodsEaten[i].type !== foodsEaten[i - 1].type) return true
  }
  return false
}

function hasAllFourTypes(foodsEaten: { type: string }[]): boolean {
  const set = new Set(foodsEaten.map((f) => f.type))
  return set.has('carrot') && set.has('apple') && set.has('piman') && set.has('goldenCarrot')
}

export function computeProgramCost(
  program: ProgramNode[],
  ownedBonusCards: BonusCardKind[],
  justPickedAdvanceInvestment: boolean,
): number {
  if (justPickedAdvanceInvestment) return 0
  const owns = (k: BonusCardKind) => ownedBonusCards.includes(k)
  const rawCost = totalProgramCost(program)
  let costMultiplier = 1
  if (owns('costDiscount')) costMultiplier *= 0.7
  if (owns('frugal') && isStraightLineProgram(program)) costMultiplier *= 0.7
  return Math.round(rawCost * costMultiplier)
}

export interface ScoreTurnInput {
  turnNumber: number
  program: ProgramNode[]
  trace: TurnTrace
  ownedBonusCards: BonusCardKind[]
  justPickedAdvanceInvestment: boolean
  cumulativeScoreBefore: number
}

export function computeTurnResult(input: ScoreTurnInput): TurnResultBreakdown {
  const { program, trace, ownedBonusCards, justPickedAdvanceInvestment } = input
  const owns = (k: BonusCardKind) => ownedBonusCards.includes(k)

  const programCost = computeProgramCost(program, ownedBonusCards, justPickedAdvanceInvestment)

  const foodPoints = trace.foodsEaten.reduce((sum, f) => sum + FOOD_VALUE[f.type], 0)

  const bonusEffects: TurnResultBreakdown['bonusEffects'] = []
  let pointMultiplier = 1

  if (owns('comfortable')) {
    pointMultiplier *= 1.25
    bonusEffects.push({ kind: 'comfortable', label: BONUS_CARD_DEFS.comfortable.name, amount: 25, isPercent: true })
  }
  if (owns('bigEater') && hasConsecutiveSameType(trace.foodsEaten)) {
    pointMultiplier *= 1.4
    bonusEffects.push({ kind: 'bigEater', label: BONUS_CARD_DEFS.bigEater.name, amount: 40, isPercent: true })
  }
  if (owns('bulkBuy') && countCards(program) >= 4) {
    pointMultiplier *= 1.1
    bonusEffects.push({ kind: 'bulkBuy', label: BONUS_CARD_DEFS.bulkBuy.name, amount: 10, isPercent: true })
  }
  if (owns('gourmet') && hasAllFourTypes(trace.foodsEaten)) {
    pointMultiplier *= 1.25
    bonusEffects.push({ kind: 'gourmet', label: BONUS_CARD_DEFS.gourmet.name, amount: 25, isPercent: true })
  }
  if (owns('noPickyEating') && hasConsecutiveDifferentType(trace.foodsEaten)) {
    pointMultiplier *= 1.4
    bonusEffects.push({ kind: 'noPickyEating', label: BONUS_CARD_DEFS.noPickyEating.name, amount: 40, isPercent: true })
  }

  let flatBonus = 0
  if (owns('simpleIsBest') && !trace.roundEnded && collectDistinctKinds(program).size <= 5) {
    flatBonus += 50
    bonusEffects.push({ kind: 'simpleIsBest', label: BONUS_CARD_DEFS.simpleIsBest.name, amount: 50, isPercent: false })
  }
  if (owns('cartStar') && trace.usedVarEqualsToMove) {
    flatBonus += 20
    bonusEffects.push({ kind: 'cartStar', label: BONUS_CARD_DEFS.cartStar.name, amount: 20, isPercent: false })
  }
  if (owns('detective') && trace.avoidedWallCollision) {
    flatBonus += 30
    bonusEffects.push({ kind: 'detective', label: BONUS_CARD_DEFS.detective.name, amount: 30, isPercent: false })
  }

  const finalFoodPoints = Math.round(foodPoints * pointMultiplier) + flatBonus
  const netScore = finalFoodPoints - programCost

  return {
    foodPoints,
    bonusEffects,
    finalFoodPoints,
    programCost,
    netScore,
    cumulativeScore: input.cumulativeScoreBefore + netScore,
    turnNumber: input.turnNumber,
    roundEnded: trace.roundEnded,
    nextTurnDraftCount: justPickedAdvanceInvestment ? 2 : 3,
  }
}