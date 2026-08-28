import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CARD_DEFS, CONDITION_KINDS } from '../../data/cards'
import { describeNode } from '../../engine/describeNode'
import { getGotoCandidates } from '../../engine/programUtils'
import type { ConditionKind, ProgramNode } from '../../types/game'
import { useBuilder } from './BuilderContext'
import { ProgramSequence } from './ProgramSequence'

interface Props {
  node: ProgramNode
  containerId: string
  index: number
  depth: number
}

export function CardBlock({ node, containerId, index, depth }: Props) {
  const { program, displayInfo, updateCondition, updateVarValue, updateGotoTarget, removeNode } = useBuilder()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { source: 'program', containerId, index, node },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const info = displayInfo.get(node.id)

  if (node.type === 'process') {
    const def = CARD_DEFS[node.kind]
    return (
      <div className="card-block card-block--process" ref={setNodeRef} style={style}>
        <span className="card-block__handle" {...attributes} {...listeners}>
          ⠿
        </span>
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
      <div className="card-block card-block--goto" ref={setNodeRef} style={style}>
        <span className="card-block__handle" {...attributes} {...listeners}>
          ⠿
        </span>
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
    <div className="card-block card-block--judgment" ref={setNodeRef} style={style}>
      <div className="card-block__header">
        <span className="card-block__handle" {...attributes} {...listeners}>
          ⠿
        </span>
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