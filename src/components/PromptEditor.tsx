import { useEffect, useRef, useState } from 'react'
import '../App.css'

type FieldId = 'expert' | 'task' | 'requirements' | 'context' | 'size' | 'tone'

const FIELD_PLACEHOLDERS: Record<FieldId, string> = {
	expert: 'an expert in (e.g. product marketing, AI safety)',
	task: 'task (e.g. write a product description)',
	requirements: 'requirements (e.g. bullet points, length, format)',
	context: 'context (e.g. target audience, background information)',
	size: 'size (e.g. short, 2 paragraphs, 100 words)',
	tone: 'tone (e.g. friendly, formal, enthusiastic)'
}

const SECTIONS: Array<{
	id: string
	tokens: Array<{ type: 'text'; value: string } | { type: 'field'; id: FieldId }>
}> = [
	{
		id: 'line1',
		tokens: [
			{ type: 'text', value: 'You are ' },
			{ type: 'field', id: 'expert' }
		]
	},
	{
		id: 'line2',
		tokens: [
			{ type: 'text', value: ' Help me with ' },
			{ type: 'field', id: 'task' }
		]
	},
	{
		id: 'req',
		tokens: [
			{ type: 'text', value: ' Requirements: ' },
			{ type: 'field', id: 'requirements' }
		]
	},
	{
		id: 'ctx',
		tokens: [
			{ type: 'text', value: ' Context: ' },
			{ type: 'field', id: 'context' }
		]
	},
	{
		id: 'size',
		tokens: [
			{ type: 'text', value: ' Size: ' },
			{ type: 'field', id: 'size' }
		]
	},
	{
		id: 'tone',
		tokens: [
			{ type: 'text', value: ' Tone: ' },
			{ type: 'field', id: 'tone' }
		]
	}
]

export default function PromptEditor({ onSaveHistory, templateRef }: { onSaveHistory?: (text: string, fields?: Record<string,string>) => void; templateRef?: React.RefObject<HTMLDivElement | null> }) {
	const [fields, setFields] = useState<Record<FieldId, { value: string; modified: boolean }>>(() => {
		const obj = {} as Record<FieldId, { value: string; modified: boolean }>
		;(Object.keys(FIELD_PLACEHOLDERS) as FieldId[]).forEach((k) => {
			obj[k] = { value: '', modified: false }
		})
		return obj
	})

	const [toast, setToast] = useState<string | null>(null)
	const firstInputRef = useRef<HTMLElement | null>(null)

	// refs for each field to manipulate DOM directly and preserve caret
	const fieldRefs = useRef<Record<FieldId, HTMLElement | null>>({} as Record<FieldId, HTMLElement | null>)

	// initialize DOM content once (keep uncontrolled contenteditable elements to preserve caret)
	useEffect(() => {
		Object.entries(fieldRefs.current).forEach(([id, el]) => {
			if (el) {
				const val = fields[id as FieldId].value || ''
				// clear any existing invisible characters when empty so :empty works
				if (val.trim().length === 0) {
					while (el.firstChild) el.removeChild(el.firstChild)
					el.dataset.empty = 'true'
				} else {
					el.innerText = val
					el.dataset.empty = 'false'
				}
			}
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		// focus first field on load
		if (firstInputRef.current) firstInputRef.current.focus()
	}, [])

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const cmd = e.metaKey || e.ctrlKey
			if (cmd && e.key.toLowerCase() === 'c') {
				e.preventDefault()
				compileAndCopy()
			}
			if (e.key === 'Escape') {
				// blur active element to allow keyboard to exit inputs
				;(document.activeElement as HTMLElement | null)?.blur()
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fields])

	useEffect(() => {
		const onHistoryLoad = (ev: Event) => {
			const detail = (ev as CustomEvent).detail as any
			if (!detail) return
			if (detail.fields) {
				Object.entries(detail.fields).forEach(([k, v]) => {
					const el = fieldRefs.current[k as FieldId]
					if (el) {
						el.innerText = v as string
						el.dataset.empty = (v as string).trim().length === 0 ? 'true' : 'false'
						setFields((s) => ({ ...s, [k]: { value: v as string, modified: (v as string).trim().length > 0 } }))
					}
				})
				return
			}
			const firstKey = Object.keys(fields)[0] as FieldId
			const el = fieldRefs.current[firstKey]
			if (el) {
				el.innerText = detail.text || ''
				el.dataset.empty = (detail.text || '').trim().length === 0 ? 'true' : 'false'
				setFields((s) => ({ ...s, [firstKey]: { value: detail.text || '', modified: (detail.text || '').trim().length > 0 } }))
			}
		}
		window.addEventListener('history:load', onHistoryLoad as EventListener)
		return () => window.removeEventListener('history:load', onHistoryLoad as EventListener)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fields])

	// contenteditable fields are updated via handleInput

	function handleInput(id: FieldId, el: HTMLElement) {
		const text = el.innerText || ''
		// update state
		setFields((s) => ({ ...s, [id]: { value: text, modified: text.trim().length > 0 } }))
		// mark empty status for CSS placeholder
		if (text.trim().length === 0) {
			el.dataset.empty = 'true'
		} else {
			el.dataset.empty = 'false'
		}
	}

	function focusField(id: FieldId) {
		const el = fieldRefs.current[id]
		if (!el) return
		el.focus()
		// place caret at end
		const range = document.createRange()
		range.selectNodeContents(el)
		range.collapse(false)
		const sel = window.getSelection()
		if (sel) {
			sel.removeAllRanges()
			sel.addRange(range)
		}
	}

	function compilePrompt(): string {
		const sectionStrings: string[] = []
		for (const section of SECTIONS) {
			// determine whether any field in this section was modified
			const fieldIds = section.tokens
				.filter((t): t is { type: 'field'; id: FieldId } => t.type === 'field')
				.map((t) => t.id)
			const anyModified = fieldIds.some((id) => fields[id].modified)
			if (!anyModified) continue

			// build the section string using field values (or placeholders if empty)
			const str = section.tokens
				.map((t) => {
					if (t.type === 'text') return t.value
					const val = fields[t.id].value.trim()
					return val.length > 0 ? val : FIELD_PLACEHOLDERS[t.id]
				})
				.join('')
			sectionStrings.push(str)
		}
		return sectionStrings.join('')
	}

	async function compileAndCopy() {
		const text = compilePrompt()
		if (!text || text.trim().length === 0) {
			setToast('Nothing to copy — fill in at least one field')
			setTimeout(() => setToast(null), 1800)
			return
		}
		try {
			await navigator.clipboard.writeText(text)
			setToast('Copied to clipboard')
			setTimeout(() => setToast(null), 1500)
			// save to history if handler provided
			if (onSaveHistory) onSaveHistory(text, Object.fromEntries(Object.entries(fields).map(([k,v])=>[k, v.value])))
			} catch {
				setToast('Copy failed')
				setTimeout(() => setToast(null), 1800)
			}
	}

	function resetAll() {
		setFields((s) => {
			const copy = { ...s }
			;(Object.keys(copy) as FieldId[]).forEach((k) => (copy[k] = { value: '', modified: false }))
			return copy
		})
		// clear DOM content of editable spans to keep them visually empty
		Object.values(fieldRefs.current).forEach((el) => {
			if (el) el.innerText = ''
		})
		setToast('Reset')
		setTimeout(() => setToast(null), 900)
		firstInputRef.current?.focus()
	}

	return (
		<div className="editor-root">
			<div className="editor-header">
				<h1 className="title">Prompt Engine</h1>
				<p className="subtitle">Select a use case and fill in the details to generate your prompt.</p>
				<div className="action-bar">
					<button className="btn btn-primary" onClick={compileAndCopy} aria-label="Copy compiled prompt">
						Copy
					</button>
					<button className="btn btn-ghost" onClick={resetAll} aria-label="Reset fields">
						Reset
					</button>
				</div>
			</div>

			<div className="editor-card" role="region" aria-label="Prompt template editor">
						<div ref={templateRef} className="prompt-text">
							{SECTIONS.map((section) => (
								<span key={section.id} className="section-inline">
									{section.tokens.map((t, ti) => {
										if (t.type === 'text') {
											return (
												<span key={`text-${section.id}-${ti}`} className="fixed-text">
													{t.value}
												</span>
											)
										}
										const id = t.id
										return (
											<span key={`wrapper-${section.id}-${ti}`} className="field-wrapper">
												{!fields[id].modified && (
													<span
														className="placeholder"
														aria-hidden
														onMouseDown={(e) => {
															e.preventDefault()
															focusField(id)
														}}
													>
														{FIELD_PLACEHOLDERS[id]}
													</span>
												)}
												<span
													key={`f-${section.id}-${ti}`}
													ref={(el) => {
														fieldRefs.current[id] = el
														if (section.id === 'line1' && ti === 1) firstInputRef.current = el
													}}
													contentEditable
													suppressContentEditableWarning
													className={`inline-field ${fields[id].modified ? 'modified' : ''}`}
													onInput={(e) => handleInput(id, e.currentTarget as HTMLElement)}
													aria-label={FIELD_PLACEHOLDERS[id]}
												/>
											</span>
										)
									})}
								</span>
							))}
						</div>
			</div>

			{toast && <div className="toast">{toast}</div>}
		</div>
	)
}
