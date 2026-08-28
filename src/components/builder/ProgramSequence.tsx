import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ProgramNode } from '../../types/game'
import { CardBlock } from './CardBlock'

interface Props {
  containerId: string
  nodes: ProgramNode[]
  depth: number
  laneLabel?: string
}

export function ProgramSequence({ containerId, nodes, depth, laneLabel }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `containerzone:${containerId}`,
    data: { source: 'program-container', containerId },
  })

  return (
    <div className={`program-sequence${isOver ? ' program-sequence--over' : ''}`} ref={setNodeRef}>
      {laneLabel && <div className={`program-sequence__lane-label program-sequence__lane-label--${laneLabel.toLowerCase()}`}>{laneLabel}</div>}
      <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {nodes.length === 0 && <div className="program-sequence__placeholder">ここにカードをドラッグ</div>}
        {nodes.map((node, index) => (
          <CardBlock key={node.id} node={node} containerId={containerId} index={index} depth={depth} />
        ))}
      </SortableContext>
    </div>
  )
}