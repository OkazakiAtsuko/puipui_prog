import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../state/GameContext'
import type { Direction, ExecutionEvent, FoodItem } from '../../types/game'
import { MapGrid } from '../map/MapGrid'
import { ProgramTraceView } from '../trace/ProgramTraceView'

function computeAnimatedState(
  events: ExecutionEvent[],
  upTo: number,
  initialPos: { x: number; y: number },
  initialDir: Direction,
  initialFoods: FoodItem[],
) {
  let pos = { ...initialPos }
  let dir = initialDir
  const foods = initialFoods.map((f) => ({ ...f }))
  const visitCounts: Record<string, number> = {}
  const judgeResults = new Map<string, boolean>()
  let currentNodeId: string | null = null
  let roundEnded = false

  const limit = Math.min(upTo, events.length)
  for (let i = 0; i < limit; i++) {
    const e = events[i]
    if ('nodeId' in e) {
      currentNodeId = e.nodeId
      visitCounts[e.nodeId] = (visitCounts[e.nodeId] || 0) + 1
    }
    switch (e.type) {
      case 'move':
        pos = { ...e.to }
        break
      case 'turn':
        dir = e.dir
        break
      case 'eat': {
        const f = foods.find((food) => food.id === e.foodId)
        if (f) f.eaten = true
        break
      }
      case 'judge':
        judgeResults.set(e.nodeId, e.result)
        break
      case 'roundEnd':
        roundEnded = true
        break
      default:
        break
    }
  }

  return { pos, dir, foods, visitCounts, judgeResults, currentNodeId, roundEnded }
}

const BASE_INTERVAL_MS = 450

export function ExecutionScreen() {
  const { state, dispatch } = useGame()
  const events = useMemo(() => state.lastTrace?.events ?? [], [state.lastTrace])
  const [playIndex, setPlayIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState<1 | 2 | 4>(1)

  useEffect(() => {
    if (!playing) return
    if (playIndex >= events.length) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setPlayIndex((i) => i + 1), BASE_INTERVAL_MS / speed)
    return () => clearTimeout(t)
  }, [playing, playIndex, events.length, speed])

  const animated = useMemo(
    () => computeAnimatedState(events, playIndex, state.robotPos, state.robotDir, state.foods),
    [events, playIndex, state.robotPos, state.robotDir, state.foods],
  )

  const done = playIndex >= events.length

  function handleFinish() {
    dispatch({ type: 'FINISH_EXECUTION' })
  }

  return (
    <div className="screen execution-screen">
      <div className="screen__header">
        <h2>
          ターン {state.turnNumber} / {state.totalTurns} - 実行中
        </h2>
      </div>
      <div className="execution-screen__columns">
        <div className="execution-screen__map">
          <MapGrid map={state.map} foods={animated.foods} robotPos={animated.pos} robotDir={animated.dir} />
          {animated.roundEnded && done && <p className="execution-screen__round-end">海に落ちてしまった！ラウンド終了です。</p>}
          <div className="execution-controls">
            <button type="button" onClick={() => setPlaying((p) => !p)}>
              {playing ? '一時停止' : '再生'}
            </button>
            <button type="button" onClick={() => setPlayIndex(events.length)}>
              最後までスキップ
            </button>
            <div className="speed-buttons">
              {([1, 2, 4] as const).map((s) => (
                <button key={s} type="button" className={speed === s ? 'active' : ''} onClick={() => setSpeed(s)}>
                  x{s}
                </button>
              ))}
            </div>
            <button type="button" className="run-button" disabled={!done} onClick={handleFinish}>
              結果を見る
            </button>
          </div>
        </div>
        <div className="execution-screen__trace">
          <h3>プログラム</h3>
          {state.lastProgram && (
            <ProgramTraceView
              nodes={state.lastProgram}
              currentNodeId={animated.currentNodeId}
              visitCounts={animated.visitCounts}
              judgeResults={animated.judgeResults}
            />
          )}
        </div>
      </div>
    </div>
  )
}