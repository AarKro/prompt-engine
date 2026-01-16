import './App.css'
import PromptEditor from './components/PromptEditor'
import History from './components/History'
import { useCallback, useRef, useState, useEffect } from 'react'

type HistoryEntry = { id: string; text: string; fields?: Record<string, string>; ts?: number }

export default function App() {
  const initialHistory = (() => {
    try {
      const raw = localStorage.getItem('prompt_history')
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
    } catch {
      return []
    }
  })()
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory)
  const historyRef = useRef<HTMLDivElement | null>(null)
  const templateRef = useRef<HTMLDivElement | null>(null)
  const [historyTopOffset, setHistoryTopOffset] = useState<number>(0)

  // measure and align history top with the template area
  useEffect(() => {
    function align() {
      const hist = historyRef.current
      const tpl = templateRef.current
      if (!hist || !tpl) return
      const tplRect = tpl.getBoundingClientRect()
      const rootRect = document.body.getBoundingClientRect()
      const offset = tplRect.top - rootRect.top
      hist.style.marginTop = `${offset}px`
    }
    align()
    window.addEventListener('resize', align)
    return () => window.removeEventListener('resize', align)
  }, [])

  const saveToHistory = useCallback((text: string, fields?: Record<string, string>) => {
    const entry: HistoryEntry = { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), text, fields, ts: Date.now() }
    setHistory((h) => {
      const next = [entry, ...h].slice(0, 50)
      try {
        localStorage.setItem('prompt_history', JSON.stringify(next))
      } catch (e) {
        console.warn('failed to write to clipboard', e)
      }
      return next
    })
  }, [])

  const onSelectHistory = useCallback(async (entry: HistoryEntry) => {
    // copy entry text to clipboard
    try {
      await navigator.clipboard.writeText(entry.text)
    } catch (e) {
      console.warn('clipboard write failed', e)
    }
    // dispatch custom event so PromptEditor can listen and populate fields
    window.dispatchEvent(new CustomEvent('history:load', { detail: entry }))
  }, [])

  return (
    <div className="app-root">
      <main className="main-layout">
        <History items={history} onSelect={onSelectHistory} containerRef={historyRef} />
        <section className="editor-area">
          <PromptEditor onSaveHistory={saveToHistory} templateRef={templateRef} />
        </section>
      </main>
    </div>
  )
}
