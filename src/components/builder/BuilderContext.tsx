import { createContext, useContext } from 'react'
import type { ConditionKind, ProgramNode } from '../../types/game'
import type { DisplayInfo } from '../../engine/programUtils'

export interface BuilderContextValue {
  program: ProgramNode[]
  displayInfo: Map<string, DisplayInfo>
  updateCondition: (nodeId: string, condition: ConditionKind) => void
  updateVarValue: (nodeId: string, value: number) => void
  updateGotoTarget: (nodeId: string, targetId: string | null) => void
  removeNode: (nodeId: string) => void
}

export const BuilderContext = createContext<BuilderContextValue | null>(null)

export function useBuilder(): BuilderContextValue {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderContext.Provider')
  return ctx
}