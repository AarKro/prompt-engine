import React from 'react'

type HistoryEntry = {
  id: string
  text: string
  fields?: Record<string, string>
  ts?: number
}

export default function History({ items, onSelect, containerRef }: { items: HistoryEntry[]; onSelect: (e: HistoryEntry) => void; containerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <aside ref={containerRef} className="history-pane" aria-label="History">
      <ul className="history-list">
        {items.map((it) => (
          <li key={it.id} className="history-item" onClick={() => onSelect(it)}>
            <div className="history-preview">
              {it.text.split(/\s+/).slice(0, 10).join(' ')}{it.text.split(/\s+/).length > 10 ? '…' : ''}
            </div>
            <div className="history-meta">{it.ts ? new Date(it.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
