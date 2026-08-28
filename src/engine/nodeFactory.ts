import { PROCESS_KINDS } from '../data/cards'
import type { CardKind, ProcessKind, ProgramNode } from '../types/game'
import { newId } from '../utils/id'

export function createNode(kind: CardKind): ProgramNode | null {
  if (kind === 'ifBranch') {
    return { type: 'judgment', id: newId('j'), condition: 'wallAhead', varValue: 0, yes: [], no: [] }
  }
  if (kind === 'goto') {
    return { type: 'goto', id: newId('g'), targetId: null }
  }
  if ((PROCESS_KINDS as string[]).includes(kind)) {
    return { type: 'process', id: newId('p'), kind: kind as ProcessKind }
  }
  return null
}