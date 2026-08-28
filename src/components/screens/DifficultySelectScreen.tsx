import { DIFFICULTY_LABELS, MAP_DEFINITIONS } from '../../data/maps'
import { useGame } from '../../state/GameContext'

export function DifficultySelectScreen() {
  const { dispatch } = useGame()

  return (
    <div className="screen difficulty-select-screen">
      <div className="screen__header">
        <h2>難易度を選んでください</h2>
        <p className="screen__score">選んだ地図で5ターン挑戦します</p>
      </div>
      <div className="difficulty-grid">
        {MAP_DEFINITIONS.map((map) => (
          <button
            key={map.id}
            type="button"
            className="difficulty-card"
            onClick={() => dispatch({ type: 'SELECT_DIFFICULTY', mapId: map.id })}
          >
            <span className="difficulty-card__level">{DIFFICULTY_LABELS[map.id]}</span>
            <h4>{map.name}</h4>
            <p className="difficulty-card__description">{map.description}</p>
            <span className="difficulty-card__size">
              {map.size} × {map.size}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
