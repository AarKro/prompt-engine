import './App.css'
import PromptEditor from './components/PromptEditor'

export default function App() {
  return (
    <div className="app-root">
      <main className="main-layout single">
        <section className="editor-area">
          <PromptEditor />
        </section>
      </main>
    </div>
  )
}
