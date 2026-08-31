import type { CardDef, CardKind, ProcessKind, ConditionKind } from '../types/game'

export const PROCESS_KINDS: ProcessKind[] = [
  'move1',
  'move3',
  'move5',
  'turnRight',
  'turnLeft',
  'setVar0',
  'incVar1',
  'decVar1',
  'eatFood',
  'skipFood',
]

export const CONDITION_KINDS: ConditionKind[] = [
  'wallAhead',
  'riverAhead',
  'seaAhead',
  'varEquals',
  'foodContact',
  'carrotAhead',
  'appleAhead',
  'pimanAhead',
  'goldenCarrotAhead',
]

export const CARD_DEFS: Record<CardKind, CardDef> = {
  start: { kind: 'start', category: 'terminal', label: '開始', cost: 0, description: 'プログラムの開始を表します。' },
  end: { kind: 'end', category: 'terminal', label: '終了', cost: 0, description: 'プログラムの終了を表します。' },

  move1: { kind: 'move1', category: 'process', label: '1マス進む', cost: 1, description: 'ノマドくんを1マス前に進めます。' },
  move3: { kind: 'move3', category: 'process', label: '3マス進む', cost: 2, description: 'ノマドくんを3マス前に進めます。' },
  move5: { kind: 'move5', category: 'process', label: '5マス進む', cost: 3, description: 'ノマドくんを5マス前に進めます。' },
  turnRight: { kind: 'turnRight', category: 'process', label: '右に90度回転', cost: 1, description: 'その場で右に90度回転します。' },
  turnLeft: { kind: 'turnLeft', category: 'process', label: '左に90度回転', cost: 1, description: 'その場で左に90度回転します。' },
  setVar0: { kind: 'setVar0', category: 'process', label: '変数に0セット', cost: 1, description: '変数の値を0にします。' },
  incVar1: { kind: 'incVar1', category: 'process', label: '変数に1プラス', cost: 1, description: '変数の値に1を足します。' },
  decVar1: { kind: 'decVar1', category: 'process', label: '変数から1マイナス', cost: 1, description: '変数の値から1を引きます。' },
  eatFood: { kind: 'eatFood', category: 'process', label: '食べる', cost: 0, description: 'マスの上にある食べ物を食べます。' },
  skipFood: { kind: 'skipFood', category: 'process', label: '食べない', cost: 0, description: 'マスの上にある食べ物を食べません(後のターンで食べられます)。' },

  ifBranch: { kind: 'ifBranch', category: 'judgment', label: 'もし〜だったら', cost: 3, description: '条件によって行動をYes/Noの2方向に分岐します。' },

  wallAhead: { kind: 'wallAhead', category: 'condition', label: '前方に壁がある', cost: 1, description: '進行方向の先が壁かどうかを判断します。' },
  riverAhead: { kind: 'riverAhead', category: 'condition', label: '前方に川がある', cost: 1, description: '進行方向の先が川かどうかを判断します。' },
  seaAhead: { kind: 'seaAhead', category: 'condition', label: '前方に海がある', cost: 1, description: '進行方向の先が海(地図の外側)かどうかを判断します。' },
  varEquals: { kind: 'varEquals', category: 'condition', label: '変数が〜', cost: 2, description: '変数の数値を判断します。' },
  foodContact: { kind: 'foodContact', category: 'condition', label: '食べ物に接触', cost: 1, description: '今いるマスに食べ物があるかどうかを判断します。' },
  carrotAhead: { kind: 'carrotAhead', category: 'condition', label: 'ニンジンがある', cost: 2, description: '今いるマスにニンジンがあるかどうかを判断します。' },
  appleAhead: { kind: 'appleAhead', category: 'condition', label: 'リンゴがある', cost: 2, description: '今いるマスにリンゴがあるかどうかを判断します。' },
  pimanAhead: { kind: 'pimanAhead', category: 'condition', label: 'ピーマンがある', cost: 2, description: '今いるマスにピーマンがあるかどうかを判断します。' },
  goldenCarrotAhead: { kind: 'goldenCarrotAhead', category: 'condition', label: '金のニンジンがある', cost: 3, description: '今いるマスに金のニンジンがあるかどうかを判断します。' },

  goto: {
    kind: 'goto',
    category: 'condition',
    label: 'ラベルに戻る',
    cost: 5,
    description:
      'Yes/Noの分岐の中に置くと、そのレーンが実行された時に指定したカードの位置まで戻ります(ループが作れます)。',
  },
}

export const CATEGORY_LABEL: Record<CardDef['category'], string> = {
  terminal: '端子',
  process: '処理',
  judgment: '判断',
  condition: '条件',
}