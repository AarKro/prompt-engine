import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Segment =
  | { type: 'text'; value: string }
  | { type: 'field'; id: string; placeholder: string }

const TEMPLATE: Segment[] = [
  { type: 'text', value: 'You are ' },
  { type: 'field', id: 'role', placeholder: 'an expert in X' },
  { type: 'text', value: '. \nHelp me with ' },
  { type: 'field', id: 'task', placeholder: 'the task I need to do' },
  { type: 'text', value: '.\n\nContext: ' },
  { type: 'field', id: 'context', placeholder: 'key background, inputs, constraints' },
  { type: 'text', value: '\nRequirements: ' },
  { type: 'field', id: 'requirements', placeholder: 'must-haves, acceptance criteria' },
  { type: 'text', value: '\nOutput format: ' },
  { type: 'field', id: 'format', placeholder: 'bullets, steps, amount of words, etc.' },
  { type: 'text', value: '\nTone: ' },
  { type: 'field', id: 'tone', placeholder: 'concise, friendly, formal, etc.' },
]

const STORAGE_KEY = 'prompt-assistant:fields:v1'

function buildClipboardText(values: Record<string, string>): string {
  const role = (values['role'] ?? '').trim()
  const task = (values['task'] ?? '').trim()
  const context = (values['context'] ?? '').trim()
  const requirements = (values['requirements'] ?? '').trim()
  const format = (values['format'] ?? '').trim()
  const tone = (values['tone'] ?? '').trim()

  let out = ''
  if (role) out += `You are ${role}.`
  if (task) out += (out ? ' ' : '') + `Help me with ${task}.`
  if (context) out += `\n\nContext: ${context}`
  if (requirements) out += `\n\nRequirements: ${requirements}`
  if (format) out += `\n\nOutput format: ${format}`
  if (tone) out += `\n\nTone: ${tone}`

  return out
}

function parsePromptText(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    // Role: "You are {role}."
    const roleMatch = text.match(/You are\s+([\s\S]*?)\./)
    if (roleMatch) out.role = roleMatch[1].trim()

    // Task: "Help me with {task}."
    const taskMatch = text.match(/Help me with\s+([\s\S]*?)\./)
    if (taskMatch) out.task = taskMatch[1].trim()

    // Sections like Context, Requirements, Output format, Tone
    const section = (label: string) => {
      const re = new RegExp(label + ':\\s*([\\s\\S]*?)(?=\\n\\n[A-Z][a-zA-Z ]+:|$)', 'm')
      const m = text.match(re)
      return m ? m[1].trim() : ''
    }

    const context = section('Context')
    if (context) out.context = context
    const requirements = section('Requirements')
    if (requirements) out.requirements = requirements
    const format = section('Output format')
    if (format) out.format = format
    const tone = section('Tone')
    if (tone) out.tone = tone
  } catch {}
  return out
}

function App() {
  const fieldIds = useMemo(() => TEMPLATE.flatMap(s => (s.type === 'field' ? [s.id] : [])), [])
  const [values, setValues] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })
  const [copied, setCopied] = useState(false)
  const HISTORY_KEY = 'prompt-assistant:history:v1'
  type HistoryEntry = { text: string; ts: string }
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null)
  const refs = useRef<Record<string, HTMLSpanElement | null>>({})
  

  const setCaretToEnd = (el: HTMLSpanElement | null) => {
    if (!el) return
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  // Sync DOM text from state only when necessary to preserve caret
  useEffect(() => {
    fieldIds.forEach((id) => {
      const el = refs.current[id]
      const desired = values[id] ?? ''
      if (el && el.innerText !== desired) {
        el.innerText = desired
      }
    })
  }, [values, fieldIds])

  // Auto-focus first field on mount
  useEffect(() => {
    const firstId = fieldIds[0]
    const el = firstId ? refs.current[firstId] : null
    if (el) {
      el.focus()
      setCaretToEnd(el)
    }
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  

  // Persist values
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    } catch {}
  }, [values])

  // Ctrl/Cmd + C to copy
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const copyCombo = (isMac && e.metaKey && e.key.toLowerCase() === 'c') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'c')
      if (copyCombo) {
        e.preventDefault()
        doCopy()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const clipboardText = useMemo(() => buildClipboardText(values), [values])

  const focusNext = (currentId: string) => {
    const idx = fieldIds.indexOf(currentId)
    if (idx >= 0) {
      const nextId = fieldIds[idx + 1]
      if (nextId && refs.current[nextId]) {
        refs.current[nextId]!.focus()
      }
    }
  }

  const focusPrev = (currentId: string) => {
    const idx = fieldIds.indexOf(currentId)
    if (idx > 0) {
      const prevId = fieldIds[idx - 1]
      if (prevId && refs.current[prevId]) {
        refs.current[prevId]!.focus()
      }
    }
  }

  const setFieldValue = (id: string, text: string) => {
    setValues(v => ({ ...v, [id]: text }))
  }

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
      try {
        // Only save non-empty prompts to history
        if (clipboardText.trim().length > 0) {
          const entry: HistoryEntry = { text: clipboardText, ts: new Date().toISOString() }
          setHistory((h) => {
            const deduped = [entry, ...h.filter(x => x.text !== clipboardText)]
            const capped = deduped.slice(0, 50)
            localStorage.setItem(HISTORY_KEY, JSON.stringify(capped))
            return capped
          })
        }
      } catch {}
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = clipboardText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
  }

  const handleHistoryClick = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
      setSelectedHistoryIdx(idx)
      const parsed = parsePromptText(text)
      // Replace current values with parsed values (only fields present in template)
      const newVals: Record<string, string> = {}
      fieldIds.forEach(id => {
        newVals[id] = parsed[id] ?? ''
      })
      // First update state so effect syncs DOM; then ensure DOM nodes are updated before focusing
      setValues(newVals)
      // Use requestAnimationFrame to wait for the next paint where DOM nodes reflect state
      requestAnimationFrame(() => {
        // Also copy text into DOM nodes directly to be extra sure
        fieldIds.forEach(id => {
          const el = refs.current[id]
          if (el) el.innerText = newVals[id] ?? ''
        })
        const firstId = fieldIds[0]
        const el = firstId ? refs.current[firstId] : null
        if (el) {
          el.focus()
          setCaretToEnd(el)
        }
      })
    } catch {}
  }

  const resetAll = () => {
    setValues({})
    const firstId = fieldIds[0]
    const el = firstId ? refs.current[firstId] : null
    if (el) {
      el.focus()
      setCaretToEnd(el)
    }
  }

  return (
    <div className="main">
      <div className="fixed-stage fixed-left" style={{ flex: 1, alignItems: 'flex-end' }}>
        <div className="history-wrap"></div>
        <div className="editor-area">
          <div className="history-wrap" aria-hidden={history.length === 0}>
            <div className="history-list">
              {history.map((h, i) => {
                const date = new Date(h.ts)
                const pad = (n: number) => n.toString().padStart(2, '0')
                const timestamp = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
                return (
                  <div key={i} className={`history-item ${selectedHistoryIdx === i ? 'selected' : ''}`} onClick={() => handleHistoryClick(h.text, i)} title={h.text}>
                    <div className="history-ts">{timestamp}</div>
                    <div className="history-content">{h.text}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed-stage" style={{ flex: 2 }}>
        <div className="header-wrap">
          
          <div className="header-block">
            <h1 className="app-title">Prompt Assistant</h1>
            <div className="app-subtitle">Fill the grey parts, press Tab to jump. Ctrl+C copies.</div>

            <div className="toolbar">
              <div className="actions">
                <button className="btn" onClick={doCopy}>Copy Prompt</button>
                <button className="btn" onClick={resetAll}>Reset</button>
                {copied && <div className="copy-toast">Copied to clipboard</div>}
              </div>
            </div>
          </div>
        </div>
        <div className="history-template-wrapper">
          <div className="prompt-card" role="group" aria-label="Prompt editor">
            <div className="prompt-text">
              {TEMPLATE.map((seg, i) => {
                if (seg.type === 'text') {
                  return (
                    <span className="static-chunk" key={`t-${i}`}>
                      {seg.value}
                    </span>
                  )
                }
                const field = seg
                const current = values[field.id] ?? ''
                const empty = current.trim().length === 0
                return (
                  <span
                    key={`f-${field.id}`}
                    ref={(el) => { refs.current[field.id] = el }}
                    className="editable"
                    contentEditable
                    spellCheck={false}
                    suppressContentEditableWarning
                    tabIndex={0}
                    data-placeholder={field.placeholder}
                    data-empty={empty}
                    aria-label={field.placeholder}
                    onFocus={(e) => setCaretToEnd(e.currentTarget as HTMLSpanElement)}
                    onInput={(e) => setFieldValue(field.id, (e.currentTarget as HTMLSpanElement).innerText)}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault()
                        if (e.shiftKey) {
                          focusPrev(field.id)
                        } else {
                          focusNext(field.id)
                        }
                      }
                    }}
                  >
                    {/* content is managed directly on the DOM to preserve caret */}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
