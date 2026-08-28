import { CARD_DEFS } from '../data/cards'
import type { ProgramNode } from '../types/game'

export function describeNode(node: ProgramNode): string {
  if (node.type === 'process') return CARD_DEFS[node.kind].label
  if (node.type === 'goto') return CARD_DEFS.goto.label
  return `もし${CARD_DEFS[node.condition].label}`
}