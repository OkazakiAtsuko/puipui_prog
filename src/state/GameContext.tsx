import { createContext, useContext, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { createInitialState, gameReducer } from './gameReducer'
import type { GameAction, GameState } from './gameReducer'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}