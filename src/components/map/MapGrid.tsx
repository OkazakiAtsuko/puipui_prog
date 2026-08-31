import { FOOD_EMOJI_FALLBACK, FOOD_IMAGE, ROBOT_IMAGE_SRC, ROBOT_NAME } from '../../data/foodAssets'
import { FOOD_LABEL } from '../../types/game'
import type { Direction, FoodItem, MapDefinition } from '../../types/game'

const DIR_ROTATION: Record<Direction, number> = { N: 0, E: 90, S: 180, W: 270 }

interface Props {
  map: MapDefinition
  foods: FoodItem[]
  robotPos: { x: number; y: number }
  robotDir: Direction
}

export function MapGrid({ map, foods, robotPos, robotDir }: Props) {
  const foodAt = new Map<string, FoodItem>()
  for (const f of foods) {
    if (!f.eaten) foodAt.set(`${f.x},${f.y}`, f)
  }

  const cells = []
  for (let y = 0; y < map.size; y++) {
    for (let x = 0; x < map.size; x++) {
      const visual = map.cells[y][x]
      const food = foodAt.get(`${x},${y}`)
      const isRobotHere = robotPos.x === x && robotPos.y === y
      cells.push(
        <div key={`${x},${y}`} className={`map-cell map-cell--${visual}`}>
          {food && (
            <span
              className={`map-cell__food${food.type === 'goldenCarrot' ? ' map-cell__food--golden' : ''}`}
              title={FOOD_LABEL[food.type]}
            >
              {FOOD_IMAGE[food.type] ? (
                <img src={FOOD_IMAGE[food.type]} alt={FOOD_LABEL[food.type]} className="map-cell__food-image" />
              ) : (
                FOOD_EMOJI_FALLBACK[food.type]
              )}
            </span>
          )}
          {isRobotHere && (
            <span className="map-cell__robot" style={{ transform: `rotate(${DIR_ROTATION[robotDir]}deg)` }}>
              <img src={ROBOT_IMAGE_SRC} alt={ROBOT_NAME} className="map-cell__robot-image" />
            </span>
          )}
        </div>,
      )
    }
  }

  return (
    <div className="map-grid-wrapper">
      <div className="map-grid" style={{ gridTemplateColumns: `repeat(${map.size}, 1fr)` }}>
        {cells}
      </div>
    </div>
  )
}
