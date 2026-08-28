import { CARD_DEFS, CONDITION_KINDS } from '../../data/cards'
import { describeNode } from '../../engine/describeNode'
import { getGotoCandidates } from '../../engine/programUtils'
import type { ConditionKind, ProgramNode } from '../../types/game'
import { useBuilder } from './BuilderContext'
import { ProgramSequence } from './ProgramSequence'

interface Props {
  node: ProgramNode
  depth: number
  isFirst: boolean
  isLast: boolean
}

function ReorderButtons({ nodeId, isFirst, isLast }: { nodeId: string; isFirst: boolean; isLast: boolean }) {
  const { moveCard } = useBuilder()
  return (
    <span className="card-block__reorder">
      <button
        type="button"
        disabled={isFirst}
        onClick={(e) => {
          e.stopPropagation()
          moveCard(nodeId, 'up')
        }}
        aria-label="上へ"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={(e) => {
          e.stopPropagation()
          moveCard(nodeId, 'down')
        }}
        aria-label="下へ"
      >
        ↓
      </button>
    </span>
  )
}

export function CardBlock({ node, depth, isFirst, isLast }: Props) {
  const { program, displayInfo, updateCondition, updateVarValue, updateGotoTarget, removeNode } = useBuilder()
  const info = displayInfo.get(node.id)

  if (node.type === 'process') {
    const def = CARD_DEFS[node.kind]
    return (
      <div className="card-block card-block--process">
        <ReorderButtons nodeId={node.id} isFirst={isFirst} isLast={isLast} />
        <span className="card-block__number">#{info?.number}</span>
        <span className="card-block__label">{def.label}</span>
        <span className="card-block__cost">{def.cost}黒豆</span>
        <button type="button" className="card-block__remove" onClick={() => removeNode(node.id)} aria-label="削除">
          ✕
        </button>
      </div>
    )
  }

  if (node.type === 'goto') {
    const candidates = getGotoCandidates(program, node.id)
    return (
      <div className="card-block card-block--goto">
        <ReorderButtons nodeId={node.id} isFirst={isFirst} isLast={isLast} />
        <span className="card-block__number">#{info?.number}</span>
        <span className="card-block__label">{CARD_DEFS.goto.label}</span>
        <select value={node.targetId ?? ''} onChange={(e) => updateGotoTarget(node.id, e.target.value || null)}>
          <option value="">戻り先を選択</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              #{displayInfo.get(c.id)?.number} {describeNode(c)}
            </option>
          ))}
        </select>
        <span className="card-block__cost">{CARD_DEFS.goto.cost}黒豆</span>
        <button type="button" className="card-block__remove" onClick={() => removeNode(node.id)} aria-label="削除">
          ✕
        </button>
      </div>
    )
  }

  const conditionDef = CARD_DEFS[node.condition]
  const cost = CARD_DEFS.ifBranch.cost + conditionDef.cost
  return (
    <div className="card-block card-block--judgment">
      <div className="card-block__header">
        <ReorderButtons nodeId={node.id} isFirst={isFirst} isLast={isLast} />
        <span className="card-block__number">#{info?.number}</span>
        <span className="card-block__label">もし</span>
        <select value={node.condition} onChange={(e) => updateCondition(node.id, e.target.value as ConditionKind)}>
          {CONDITION_KINDS.map((k) => (
            <option key={k} value={k}>
              {CARD_DEFS[k].label}
            </option>
          ))}
        </select>
        {node.condition === 'varEquals' && (
          <input
            type="number"
            min={0}
            max={9}
            value={node.varValue}
            onChange={(e) => updateVarValue(node.id, Number(e.target.value))}
            className="card-block__var-input"
          />
        )}
        <span className="card-block__label">だったら</span>
        <span className="card-block__cost">{cost}黒豆</span>
        <button type="button" className="card-block__remove" onClick={() => removeNode(node.id)} aria-label="削除">
          ✕
        </button>
      </div>
      <div className="card-block__branches">
        <ProgramSequence containerId={`${node.id}:yes`} nodes={node.yes} depth={depth + 1} laneLabel="Yes" />
        <ProgramSequence containerId={`${node.id}:no`} nodes={node.no} depth={depth + 1} laneLabel="No" />
      </div>
    </div>
  )
}
