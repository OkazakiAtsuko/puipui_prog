import { describeNode } from '../../engine/describeNode'
import type { ProgramNode } from '../../types/game'

interface Props {
  nodes: ProgramNode[]
  currentNodeId: string | null
  visitCounts: Record<string, number>
  judgeResults: Map<string, boolean>
}

export function ProgramTraceView({ nodes, currentNodeId, visitCounts, judgeResults }: Props) {
  return (
    <div className="trace-view">
      {nodes.map((node) => (
        <TraceNode key={node.id} node={node} currentNodeId={currentNodeId} visitCounts={visitCounts} judgeResults={judgeResults} />
      ))}
    </div>
  )
}

function TraceNode({ node, currentNodeId, visitCounts, judgeResults }: Props & { node: ProgramNode }) {
  const isCurrent = node.id === currentNodeId
  const visits = visitCounts[node.id] ?? 0
  const label = describeNode(node)

  if (node.type !== 'judgment') {
    return (
      <div className={`trace-card${isCurrent ? ' trace-card--current' : ''}`}>
        <span>{label}</span>
        {visits > 1 && <span className="trace-card__badge">{visits}周目</span>}
      </div>
    )
  }

  const result = judgeResults.get(node.id)
  return (
    <div className={`trace-card trace-card--judgment${isCurrent ? ' trace-card--current' : ''}`}>
      <div className="trace-card__title">
        <span>{label}</span>
        {visits > 1 && <span className="trace-card__badge">{visits}周目</span>}
      </div>
      <div className="trace-card__branches">
        <div className={`trace-lane${result === false ? ' trace-lane--greyed' : ''}`}>
          <div className="trace-lane__label">Yes</div>
          <ProgramTraceView nodes={node.yes} currentNodeId={currentNodeId} visitCounts={visitCounts} judgeResults={judgeResults} />
        </div>
        <div className={`trace-lane${result === true ? ' trace-lane--greyed' : ''}`}>
          <div className="trace-lane__label">No</div>
          <ProgramTraceView nodes={node.no} currentNodeId={currentNodeId} visitCounts={visitCounts} judgeResults={judgeResults} />
        </div>
      </div>
    </div>
  )
}