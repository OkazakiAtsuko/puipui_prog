import { FOOD_EMOJI_FALLBACK, FOOD_IMAGE, ROBOT_NAME } from '../../data/foodAssets'
import { useGame } from '../../state/GameContext'
import { FOOD_LABEL, FOOD_VALUE } from '../../types/game'
import type { FoodType } from '../../types/game'

const FOOD_TYPES: FoodType[] = ['carrot', 'apple', 'piman', 'goldenCarrot']

export function RulesScreen() {
  const { dispatch } = useGame()

  return (
    <div className="screen rules-screen">
      <div className="screen__header">
        <h2>あそびかた</h2>
      </div>

      <section className="rules-section">
        <h3>1. 目的</h3>
        <p>
          モルモットの「{ROBOT_NAME}」を動かして、黒豆(得点)をたくさん集めよう！
          カードを組み合わせてプログラムを作り、{ROBOT_NAME}に実行させて地図の上にある食べ物を集めます。
          5ターンの間にできるだけ多くの黒豆を集めるのが目標です。
        </p>
      </section>

      <section className="rules-section">
        <h3>2. 食べ物の得点</h3>
        <ul className="rules-food-list">
          {FOOD_TYPES.map((type) => (
            <li key={type} className="rules-food-list__item">
              <span className="rules-food-list__icon">
                {FOOD_IMAGE[type] ? (
                  <img src={FOOD_IMAGE[type]} alt={FOOD_LABEL[type]} />
                ) : (
                  FOOD_EMOJI_FALLBACK[type]
                )}
              </span>
              <span className="rules-food-list__label">{FOOD_LABEL[type]}</span>
              <span className="rules-food-list__value">{FOOD_VALUE[type]}黒豆</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rules-section">
        <h3>3. カードの追加方法</h3>
        <ol>
          <li>左側のカード一覧から使いたいカードをクリックすると、選択中の場所(枠が光っている場所)の一番下に追加されます。</li>
          <li>「もし〜だったら」カードのYes/Noレーンをクリックすると、そこが選択され、続けてカードを追加できるようになります。</li>
          <li>カード左側の「↑」「↓」ボタンで、同じ列の中で順番を入れ替えられます。</li>
          <li>プログラムには「コスト」があり、所持している黒豆を超えるプログラムは実行できません。</li>
        </ol>
      </section>

      <button type="button" className="run-button rules-start-button" onClick={() => dispatch({ type: 'ACKNOWLEDGE_RULES' })}>
        はじめる
      </button>
    </div>
  )
}
