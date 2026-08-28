import { BONUS_CARD_DEFS } from '../../data/bonusCards'
import { useGame } from '../../state/GameContext'

export function BonusCardSelectScreen() {
  const { state, dispatch } = useGame()

  return (
    <div className="screen bonus-select-screen">
      <div className="screen__header">
        <h2>
          ターン {state.turnNumber} / {state.totalTurns}
        </h2>
        <p className="screen__score">今持っている黒豆: {state.cumulativeScore}</p>
      </div>
      <h3>ボーナスカードを1枚選んでください</h3>
      <div className="bonus-card-grid">
        {state.currentDraft.map((kind, i) => {
          const def = BONUS_CARD_DEFS[kind]
          return (
            <button
              key={`${kind}-${i}`}
              type="button"
              className="bonus-card"
              onClick={() => dispatch({ type: 'PICK_BONUS_CARD', kind })}
            >
              <h4>{def.name}</h4>
              <p className="bonus-card__effect">{def.effectText}</p>
              <p className="bonus-card__trigger">発動条件: {def.triggerText}</p>
            </button>
          )
        })}
      </div>
      {state.ownedBonusCards.length > 0 && (
        <div className="owned-bonus-list">
          <h4>これまでに獲得したボーナスカード</h4>
          <div className="owned-bonus-list__items">
            {state.ownedBonusCards.map((kind, i) => (
              <span key={`${kind}-${i}`} className="owned-bonus-badge">
                {BONUS_CARD_DEFS[kind].name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}