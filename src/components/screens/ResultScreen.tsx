import { useGame } from '../../state/GameContext'
import { isGameOver } from '../../state/gameReducer'
import { FOOD_LABEL, FOOD_VALUE } from '../../types/game'

export function ResultScreen() {
  const { state, dispatch } = useGame()
  const result = state.lastResult
  const trace = state.lastTrace
  if (!result || !trace) return null

  const gameOver = isGameOver(state)

  return (
    <div className="screen result-screen">
      <div className="screen__header">
        <h2>
          ターン {result.turnNumber} / {state.totalTurns} の結果
        </h2>
      </div>

      {trace.roundEnded && <p className="result-screen__round-end">海に落ちてしまったため、ラウンドはここで終了です。</p>}

      <div className="result-breakdown">
        <section>
          <h3>1. 食べ物の報酬</h3>
          {trace.foodsEaten.length === 0 && <p>何も食べられませんでした。</p>}
          <ul>
            {trace.foodsEaten.map((f, i) => (
              <li key={`${f.foodId}-${i}`}>
                {FOOD_LABEL[f.type]} +{FOOD_VALUE[f.type]}黒豆
              </li>
            ))}
          </ul>
          <p className="result-breakdown__subtotal">小計: {result.foodPoints}黒豆</p>
        </section>

        <section>
          <h3>2. ボーナス効果</h3>
          {result.bonusEffects.length === 0 && <p>発動したボーナス効果はありません。</p>}
          <ul>
            {result.bonusEffects.map((b, i) => (
              <li key={`${b.kind}-${i}`}>
                {b.label}: {b.isPercent ? `+${b.amount}%` : `+${b.amount}点`}
              </li>
            ))}
          </ul>
          <p className="result-breakdown__subtotal">獲得した黒豆(ボーナス込み): {result.finalFoodPoints}黒豆</p>
        </section>

        <section>
          <h3>3. プログラムのコスト</h3>
          <p className="result-breakdown__subtotal">-{result.programCost}黒豆</p>
        </section>

        <section className="result-breakdown__net">
          <h3>4. このターンの純利益</h3>
          <p>
            {result.netScore >= 0 ? '+' : ''}
            {result.netScore}黒豆
          </p>
        </section>
      </div>

      <div className="progress-indicator">
        累計獲得黒豆: {result.cumulativeScore}黒豆 (現在 {result.turnNumber} / {state.totalTurns} ターン)
      </div>

      {state.justPickedAdvanceInvestment && (
        <p className="advance-investment-note">
          「先行投資」の効果で今回のコストは0になりました。代わりに次のターンのボーナスカード候補は2枚になります。
        </p>
      )}

      {state.foodsReplenished && (
        <p className="advance-investment-note">地図の食べ物を全部食べ尽くしたので、新しい食べ物が地図に出現しました。</p>
      )}

      {gameOver ? (
        <div className="final-banner">
          <h2>ゲーム終了！お疲れ様でした</h2>
          <p>最終スコア: {result.cumulativeScore}黒豆</p>
          <button type="button" className="run-button" onClick={() => dispatch({ type: 'START_GAME' })}>
            もう一度遊ぶ
          </button>
        </div>
      ) : (
        <button type="button" className="run-button" onClick={() => dispatch({ type: 'NEXT_TURN' })}>
          次のターンへ
        </button>
      )}
    </div>
  )
}