import { useEffect, useMemo, useState } from 'react'
import { CARD_DEFS } from '../../data/cards'
import { createNode } from '../../engine/nodeFactory'
import {
  assignDisplayInfo,
  canPlaceJudgmentAt,
  countCards,
  insertNode,
  locateContainer,
  removeNode as removeNodeFromTree,
  swapAdjacent,
  updateNode,
} from '../../engine/programUtils'
import { computeProgramCost } from '../../engine/scoring'
import { useGame } from '../../state/GameContext'
import type { CardKind, ConditionKind, ProgramNode } from '../../types/game'
import { BuilderContext } from '../builder/BuilderContext'
import { CardPalette } from '../builder/CardPalette'
import { ProgramSequence } from '../builder/ProgramSequence'
import { MapGrid } from '../map/MapGrid'

export function ProgramBuilderScreen() {
  const { state, dispatch } = useGame()
  const [program, setProgram] = useState<ProgramNode[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [activeContainerId, setActiveContainerId] = useState('root')

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

  // カードの削除などで選択中のコンテナ(Yes/Noレーン)が無くなった場合は、追加先をメインの列に戻す。
  useEffect(() => {
    if (activeContainerId === 'root') return
    if (!locateContainer(program, activeContainerId)) setActiveContainerId('root')
  }, [program, activeContainerId])

  const displayInfo = useMemo(() => assignDisplayInfo(program), [program])
  const effectiveCost = useMemo(
    () => computeProgramCost(program, state.ownedBonusCards, state.justPickedAdvanceInvestment),
    [program, state.ownedBonusCards, state.justPickedAdvanceInvestment],
  )
  const cardCount = useMemo(() => countCards(program), [program])
  const canAfford = effectiveCost <= state.cumulativeScore

  function handleAddCard(kind: CardKind) {
    if (kind === 'ifBranch' && !canPlaceJudgmentAt(program, activeContainerId)) {
      setNotice('判断カードは1段階までしかネストできません')
      return
    }
    const node = createNode(kind)
    if (!node) return
    setProgram(insertNode(program, activeContainerId, 1e9, node))
  }

  function handleMoveCard(nodeId: string, direction: 'up' | 'down') {
    setProgram(swapAdjacent(program, nodeId, direction))
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

  return (
    <BuilderContext.Provider
      value={{
        program,
        displayInfo,
        activeContainerId,
        setActiveContainerId,
        addCard: handleAddCard,
        moveCard: handleMoveCard,
        updateCondition,
        updateVarValue,
        updateGotoTarget,
        removeNode: handleRemoveNode,
      }}
    >
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
    </BuilderContext.Provider>
  )
}
