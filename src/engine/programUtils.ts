import { CARD_DEFS } from '../data/cards'
import type { ProgramNode } from '../types/game'

export const MAX_JUDGMENT_DEPTH = 1

export function cloneProgram(nodes: ProgramNode[]): ProgramNode[] {
  return nodes.map((n) => (n.type === 'judgment' ? { ...n, yes: cloneProgram(n.yes), no: cloneProgram(n.no) } : { ...n }))
}

export function findNodeById(nodes: ProgramNode[], id: string): ProgramNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.type === 'judgment') {
      const found = findNodeById(n.yes, id) || findNodeById(n.no, id)
      if (found) return found
    }
  }
  return null
}

export function locateContainer(tree: ProgramNode[], containerId: string): ProgramNode[] | null {
  if (containerId === 'root') return tree
  const [jid, lane] = containerId.split(':')
  const node = findNodeById(tree, jid)
  if (node && node.type === 'judgment') {
    return lane === 'yes' ? node.yes : node.no
  }
  return null
}

interface Location {
  containerId: string
  index: number
}

export function locate(nodes: ProgramNode[], id: string, containerId = 'root'): Location | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    if (n.id === id) return { containerId, index: i }
    if (n.type === 'judgment') {
      const r = locate(n.yes, id, `${n.id}:yes`) || locate(n.no, id, `${n.id}:no`)
      if (r) return r
    }
  }
  return null
}

function computeDepths(nodes: ProgramNode[], depth: number, map: Map<string, number>) {
  for (const n of nodes) {
    map.set(n.id, depth)
    if (n.type === 'judgment') {
      computeDepths(n.yes, depth + 1, map)
      computeDepths(n.no, depth + 1, map)
    }
  }
}

export function containerDepth(tree: ProgramNode[], containerId: string): number {
  if (containerId === 'root') return 0
  const jid = containerId.split(':')[0]
  const depths = new Map<string, number>()
  computeDepths(tree, 0, depths)
  return (depths.get(jid) ?? 0) + 1
}

export function canPlaceJudgmentAt(tree: ProgramNode[], containerId: string): boolean {
  return containerDepth(tree, containerId) <= MAX_JUDGMENT_DEPTH
}

export interface DisplayInfo {
  number: number
  containerId: string
  index: number
}

export function assignDisplayInfo(
  nodes: ProgramNode[],
  containerId = 'root',
  counter: { n: number } = { n: 1 },
  out: Map<string, DisplayInfo> = new Map(),
): Map<string, DisplayInfo> {
  nodes.forEach((node, index) => {
    out.set(node.id, { number: counter.n++, containerId, index })
    if (node.type === 'judgment') {
      assignDisplayInfo(node.yes, `${node.id}:yes`, counter, out)
      assignDisplayInfo(node.no, `${node.id}:no`, counter, out)
    }
  })
  return out
}

// 「ラベルに戻る」の戻り先候補: 自分より前・同じ階層(同じ配列)にあるカード、
// および自分がYes/Noレーンの中にいる場合はそのレーンを持つ判断カード自身。
export function getGotoCandidates(tree: ProgramNode[], gotoId: string): ProgramNode[] {
  const loc = locate(tree, gotoId)
  if (!loc) return []
  const container = locateContainer(tree, loc.containerId)
  if (!container) return []
  const candidates: ProgramNode[] = container.slice(0, loc.index)
  if (loc.containerId !== 'root') {
    const jid = loc.containerId.split(':')[0]
    const owner = findNodeById(tree, jid)
    if (owner) candidates.push(owner)
  }
  return candidates
}

export function insertNode(tree: ProgramNode[], containerId: string, index: number, node: ProgramNode): ProgramNode[] {
  const clone = cloneProgram(tree)
  const container = locateContainer(clone, containerId)
  if (!container) return tree
  container.splice(Math.max(0, Math.min(index, container.length)), 0, node)
  return clone
}

export function removeNode(tree: ProgramNode[], nodeId: string): ProgramNode[] {
  const clone = cloneProgram(tree)
  const loc = locate(clone, nodeId)
  if (!loc) return tree
  const container = locateContainer(clone, loc.containerId)
  if (!container) return tree
  container.splice(loc.index, 1)
  return clone
}

// 同じ配列(コンテナ)内で、1つ前または1つ後ろのカードと入れ替える。
export function swapAdjacent(tree: ProgramNode[], nodeId: string, direction: 'up' | 'down'): ProgramNode[] {
  const clone = cloneProgram(tree)
  const loc = locate(clone, nodeId)
  if (!loc) return tree
  const container = locateContainer(clone, loc.containerId)
  if (!container) return tree
  const targetIndex = direction === 'up' ? loc.index - 1 : loc.index + 1
  if (targetIndex < 0 || targetIndex >= container.length) return tree
  const tmp = container[loc.index]
  container[loc.index] = container[targetIndex]
  container[targetIndex] = tmp
  return clone
}

export function updateNode(tree: ProgramNode[], nodeId: string, updater: (n: ProgramNode) => ProgramNode): ProgramNode[] {
  const clone = cloneProgram(tree)
  function walk(nodes: ProgramNode[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        nodes[i] = updater(nodes[i])
        return true
      }
      const n = nodes[i]
      if (n.type === 'judgment') {
        if (walk(n.yes) || walk(n.no)) return true
      }
    }
    return false
  }
  walk(clone)
  return clone
}

export function totalProgramCost(nodes: ProgramNode[]): number {
  let sum = 0
  for (const n of nodes) {
    if (n.type === 'process') sum += CARD_DEFS[n.kind].cost
    else if (n.type === 'goto') sum += CARD_DEFS.goto.cost
    else if (n.type === 'judgment') {
      sum += CARD_DEFS.ifBranch.cost + CARD_DEFS[n.condition].cost
      sum += totalProgramCost(n.yes) + totalProgramCost(n.no)
    }
  }
  return sum
}

export function countCards(nodes: ProgramNode[]): number {
  let count = 0
  for (const n of nodes) {
    count += 1
    if (n.type === 'judgment') count += countCards(n.yes) + countCards(n.no)
  }
  return count
}

export function collectDistinctKinds(nodes: ProgramNode[], set: Set<string> = new Set()): Set<string> {
  for (const n of nodes) {
    if (n.type === 'process') set.add(n.kind)
    else if (n.type === 'goto') set.add('goto')
    else if (n.type === 'judgment') {
      set.add('ifBranch')
      set.add(n.condition)
      collectDistinctKinds(n.yes, set)
      collectDistinctKinds(n.no, set)
    }
  }
  return set
}

export function isStraightLineProgram(nodes: ProgramNode[]): boolean {
  return !nodes.some((n) => n.type === 'judgment' || n.type === 'goto')
}