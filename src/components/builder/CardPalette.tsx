import { useDraggable } from '@dnd-kit/core'
import { CARD_DEFS, CONDITION_KINDS, PROCESS_KINDS } from '../../data/cards'
import type { CardKind } from '../../types/game'

function PaletteItem({ kind }: { kind: CardKind }) {
  const def = CARD_DEFS[kind]
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${kind}`,
    data: { source: 'palette', kind },
  })
  return (
    <div
      className={`palette-item${isDragging ? ' palette-item--dragging' : ''}`}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={def.description}
    >
      <span className="palette-item__label">{def.label}</span>
      <span className="palette-item__cost">{def.cost}黒豆</span>
    </div>
  )
}

export function CardPalette() {
  return (
    <div className="card-palette">
      <div className="card-palette__category">
        <h3>端子</h3>
        <div className="reference-item">
          <span>{CARD_DEFS.start.label}</span>
          <span className="reference-item__cost">0黒豆・固定</span>
        </div>
        <div className="reference-item">
          <span>{CARD_DEFS.end.label}</span>
          <span className="reference-item__cost">0黒豆・固定</span>
        </div>
      </div>

      <div className="card-palette__category">
        <h3>処理</h3>
        {PROCESS_KINDS.map((k) => (
          <PaletteItem key={k} kind={k} />
        ))}
      </div>

      <div className="card-palette__category">
        <h3>判断</h3>
        <PaletteItem kind="ifBranch" />
        <p className="card-palette__hint">配置後に条件を選べます(条件のコストは別途加算されます)。分岐の中にさらに分岐を作れるのは1段階までです。</p>
      </div>

      <div className="card-palette__category">
        <h3>条件(判断カードで選択)</h3>
        {CONDITION_KINDS.map((k) => (
          <div key={k} className="reference-item" title={CARD_DEFS[k].description}>
            <span>{CARD_DEFS[k].label}</span>
            <span className="reference-item__cost">{CARD_DEFS[k].cost}黒豆</span>
          </div>
        ))}
      </div>

      <div className="card-palette__category">
        <h3>ループ</h3>
        <PaletteItem kind="goto" />
        <p className="card-palette__hint">Yes/Noレーンの中に置くと、指定したカードの位置まで戻れます(ループが作れます)。</p>
      </div>
    </div>
  )
}