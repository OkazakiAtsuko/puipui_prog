import type { ProgramNode } from '../../types/game'
import { CardBlock } from './CardBlock'
import { useBuilder } from './BuilderContext'

interface Props {
  containerId: string
  nodes: ProgramNode[]
  depth: number
  laneLabel?: string
}

export function ProgramSequence({ containerId, nodes, depth, laneLabel }: Props) {
  const { activeContainerId, setActiveContainerId } = useBuilder()
  const isActive = activeContainerId === containerId

  return (
    <div
      className={`program-sequence${isActive ? ' program-sequence--active' : ''}`}
      onClick={(e) => {
        // 入れ子になったYes/Noレーンをクリックした際、外側(ルート列など)のonClickにまで
        // イベントが伝播して選択が上書きされてしまうのを防ぐ。
        e.stopPropagation()
        setActiveContainerId(containerId)
      }}
    >
      {laneLabel && (
        <div className={`program-sequence__lane-label program-sequence__lane-label--${laneLabel.toLowerCase()}`}>
          {laneLabel}
        </div>
      )}
      {nodes.length === 0 && (
        <div className="program-sequence__placeholder">{isActive ? 'ここにカードが追加されます' : 'クリックしてここに追加'}</div>
      )}
      {nodes.map((node, index) => (
        <CardBlock key={node.id} node={node} depth={depth} isFirst={index === 0} isLast={index === nodes.length - 1} />
      ))}
    </div>
  )
}
