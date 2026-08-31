import type { FoodType } from '../types/game'

// 白背景のPNG画像を使う食べ物(表示側で mix-blend-mode:multiply により背景となじませる)
export const FOOD_IMAGE: Partial<Record<FoodType, string>> = {
  carrot: '/img/ninjin.png',
  apple: '/img/ringo.png',
  piman: '/img/pi-man.png',
}

// 画像を用意していない食べ物は絵文字で表示する
export const FOOD_EMOJI_FALLBACK: Partial<Record<FoodType, string>> = {
  goldenCarrot: '🥕',
}

export const ROBOT_IMAGE_SRC = '/img/nomadkun.png'
export const ROBOT_NAME = 'ノマドくん'
