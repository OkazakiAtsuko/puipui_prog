import type { BonusCardDef, BonusCardKind } from '../types/game'

export const BONUS_CARD_DEFS: Record<BonusCardKind, BonusCardDef> = {
  costDiscount: {
    kind: 'costDiscount',
    name: 'コスト割引',
    effectText: 'プログラムのコストが70%になる(30%引き)',
    triggerText: '獲得した以降、毎ターン自動で適用',
  },
  comfortable: {
    kind: 'comfortable',
    name: '快便',
    effectText: '獲得できる黒豆が25%アップする',
    triggerText: '獲得した以降、毎ターン自動で適用',
  },
  bigEater: {
    kind: 'bigEater',
    name: '大食い',
    effectText: '獲得できる黒豆が40%アップする',
    triggerText: '同じ食べ物を連続で食べたターンに適用',
  },
  frugal: {
    kind: 'frugal',
    name: '節約家',
    effectText: 'プログラムのコストが70%になる(30%引き)',
    triggerText: '端子と処理カードのみでプログラムを組んだターンに適用',
  },
  bulkBuy: {
    kind: 'bulkBuy',
    name: 'まとめ買い',
    effectText: '獲得できる黒豆が10%アップする',
    triggerText: '1ターンに4枚以上プログラムを組んだ時に適用',
  },
  advanceInvestment: {
    kind: 'advanceInvestment',
    name: '先行投資',
    effectText: 'このターンのプログラムのコストが0になる',
    triggerText: '引いた時点で即発動。代わりに次のターンのカード候補が2枚になる',
  },
  gourmet: {
    kind: 'gourmet',
    name: 'グルメ',
    effectText: '獲得できる黒豆が25%アップする',
    triggerText: 'ニンジン・リンゴ・ピーマン・金のニンジンを1ターンで全種類食べた時に適用',
  },
  noPickyEating: {
    kind: 'noPickyEating',
    name: '好き嫌いなし',
    effectText: '獲得できる黒豆が40%アップする',
    triggerText: '異なる種類の食べ物を連続で食べたターンに適用',
  },
  simpleIsBest: {
    kind: 'simpleIsBest',
    name: 'シンプルイズベスト',
    effectText: '+50点',
    triggerText: '使用カードの種類数が5種以下でそのターンを終えた時に適用',
  },
  cartStar: {
    kind: 'cartStar',
    name: 'カートスター',
    effectText: '+20点',
    triggerText: '「変数が〜」の条件カードを使って移動できた時に適用',
  },
  detective: {
    kind: 'detective',
    name: '名探偵',
    effectText: '+30点',
    triggerText: '「前方に壁がある」の条件カードを使って衝突を回避できた時に適用',
  },
}

export const BONUS_CARD_KINDS = Object.keys(BONUS_CARD_DEFS) as BonusCardKind[]