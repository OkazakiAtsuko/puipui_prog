import { BonusCardSelectScreen } from './components/screens/BonusCardSelectScreen'
import { DifficultySelectScreen } from './components/screens/DifficultySelectScreen'
import { ExecutionScreen } from './components/screens/ExecutionScreen'
import { ProgramBuilderScreen } from './components/screens/ProgramBuilderScreen'
import { ResultScreen } from './components/screens/ResultScreen'
import { GameProvider, useGame } from './state/GameContext'

function GameScreens() {
  const { state } = useGame()

  switch (state.phase) {
    case 'difficultySelect':
      return <DifficultySelectScreen />
    case 'bonusSelect':
      return <BonusCardSelectScreen />
    case 'build':
      return <ProgramBuilderScreen />
    case 'execute':
      return <ExecutionScreen />
    case 'result':
      return <ResultScreen />
    default:
      return null
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="app">
        <header className="app__title">
          <h1>ぷいぷいプログラム</h1>
        </header>
        <main className="app__content">
          <GameScreens />
        </main>
      </div>
    </GameProvider>
  )
}