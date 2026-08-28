import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import { CARD_DEFS } from '../../data/cards'
import { describeNode } from '../../engine/describeNode'
import { createNode } from '../../engine/nodeFactory'
import {
  assignDisplayInfo,
  canPlaceJudgmentAt,
  countCards,
  insertNode,
  moveNode,
  removeNode as removeNodeFromTree,
  updateNode,
} from '../../engine/programUtils'
import { computeProgramCost } from '../../engine/scoring'
import { useGame } from '../../state/GameContext'
import type { CardKind, ConditionKind, ProgramNode } from '../../types/game'
import { BuilderContext } from '../builder/BuilderContext'
import { CardPalette } from '../builder/CardPalette'
import { ProgramSequence } from '../builder/ProgramSequence'
import { MapGrid } from '../map/MapGrid'

interface DragPayload {
  source: 'palette' | 'program'
  kind?: CardKind
  node?: ProgramNode
}

export function ProgramBuilderScreen() {
  const { state, dispatch } = useGame()
  const [program, setProgram] = useState<ProgramNode[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const displayInfo = useMemo(() => assignDisplayInfo(program), [program])
  const effectiveCost = useMemo(
    () => computeProgramCost(program, state.ownedBonusCards, state.justPickedAdvanceInvestment),
    [program, state.ownedBonusCards, state.justPickedAdvanceInvestment],
  )
  const cardCount = useMemo(() => countCards(program), [program])
  const canAfford = effectiveCost <= state.cumulativeScore

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as unknown as DragPayload | undefined
    if (data) setActiveDrag(data)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return
    const activeData = active.data.current as unknown as
      | { source: 'palette'; kind: CardKind }
      | { source: 'program'; containerId: string; index: number; node: ProgramNode }
      | undefined
    const overData = over.data.current as unknown as
      | { source: 'program-container'; containerId: string }
      | { source: 'program'; containerId: string; index: number; node: ProgramNode }
      | undefined
    if (!activeData || !overData) return

    if (activeData.source === 'palette') {
      const targetContainerId = overData.containerId
      const targetIndex = overData.source === 'program' ? overData.index : 1e9
      if (activeData.kind === 'ifBranch' && !canPlaceJudgmentAt(program, targetContainerId)) {
        setNotice('判断カードは1段階までしかネストできません')
        return
      }
      const node = createNode(activeData.kind)
      if (!node) return
      setProgram(insertNode(program, targetContainerId, targetIndex, node))
      return
    }

    if (activeData.source === 'program') {
      if (active.id === over.id) return
      const nodeId = active.id as string
      const targetContainerId = overData.containerId
      const targetIndex = overData.source === 'program' ? overData.index : 1e9
      if (
        activeData.node.type === 'judgment' &&
        targetContainerId !== activeData.containerId &&
        !canPlaceJudgmentAt(program, targetContainerId)
      ) {
        setNotice('判断カードは1段階までしかネストできません')
        return
      }
      setProgram(moveNode(program, nodeId, targetContainerId, targetIndex))
    }
  }

  function updateCondition(nodeId: string, condition: ConditionKind) {
    setProgram(updateNode(program, nodeId, (n) => (n.type === 'judgment' ? { ...n, condition } : n)))
  }

  function updateVarValue(nodeId: string, value: number) {
    setProgram(updateNode(program, nodeId, (n) => (n.type === 'judgment' ? { ...n, varValue: value } : n)))
  }

  function updateGotoTarget(nodeId: string, targetId: string | null) {
    setProgram(updateNode(program, nodeId, (n) => (n.type === 'goto' ? { ...n, targetId } : n)))
  }

  function handleRemoveNode(nodeId: string) {
    setProgram(removeNodeFromTree(program, nodeId))
  }

  function handleRun() {
    if (!canAfford) return
    dispatch({ type: 'RUN_PROGRAM', program })
  }

  const overlayLabel = activeDrag
    ? activeDrag.source === 'palette' && activeDrag.kind
      ? CARD_DEFS[activeDrag.kind].label
      : activeDrag.node
        ? describeNode(activeDrag.node)
        : null
    : null

  return (
    <BuilderContext.Provider
      value={{ program, displayInfo, updateCondition, updateVarValue, updateGotoTarget, removeNode: handleRemoveNode }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="screen builder-screen">
          <div className="screen__header">
            <h2>
              ターン {state.turnNumber} / {state.totalTurns} - プログラムを組み立てよう
            </h2>
            {notice && <p className="builder-notice">{notice}</p>}
          </div>
          <div className="builder-screen__columns">
            <div className="builder-screen__palette">
              <CardPalette />
            </div>
            <div className="builder-screen__build-area">
              <div className="fixed-card fixed-card--start">{CARD_DEFS.start.label}</div>
              <ProgramSequence containerId="root" nodes={program} depth={0} />
              <div className="fixed-card fixed-card--end">{CARD_DEFS.end.label}</div>
            </div>
            <div className="builder-screen__sidebar">
              <div className="map-preview">
                <h3>{state.map.name}</h3>
                <MapGrid map={state.map} foods={state.foods} robotPos={state.robotPos} robotDir={state.robotDir} />
              </div>
              <div className="cost-summary">
                <p>使用カード枚数: {cardCount}</p>
                <p>プログラムのコスト: {effectiveCost}黒豆</p>
                <p>現在の黒豆: {state.cumulativeScore}</p>
                {!canAfford && <p className="cost-summary__warning">黒豆が足りません</p>}
              </div>
              <button type="button" className="run-button" disabled={!canAfford} onClick={handleRun}>
                プログラムを実行する
              </button>
            </div>
          </div>
        </div>
        <DragOverlay>{overlayLabel ? <div className="drag-overlay-card">{overlayLabel}</div> : null}</DragOverlay>
      </DndContext>
    </BuilderContext.Provider>
  )
}