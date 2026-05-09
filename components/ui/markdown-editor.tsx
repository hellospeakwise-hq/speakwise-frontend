'use client'

import { useState } from 'react'
import { Eye, Pencil, Bold, Italic, List, Heading2, Link as LinkIcon, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { MarkdownContent } from './markdown-content'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    className?: string
    disabled?: boolean
}

function insertAround(text: string, start: number, end: number, before: string, after: string) {
    const selected = text.slice(start, end)
    return {
        newText: text.slice(0, start) + before + selected + after + text.slice(end),
        newCursor: end + before.length + after.length,
    }
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 8, className, disabled }: MarkdownEditorProps) {
    const [mode, setMode] = useState<'write' | 'preview'>('write')
    const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

    const wrap = (before: string, after: string) => {
        if (!textareaRef) return
        const { selectionStart: s, selectionEnd: e } = textareaRef
        const { newText, newCursor } = insertAround(value, s, e, before, after)
        onChange(newText)
        requestAnimationFrame(() => {
            textareaRef.focus()
            textareaRef.setSelectionRange(newCursor, newCursor)
        })
    }

    const wrapLine = (prefix: string) => {
        if (!textareaRef) return
        const s = textareaRef.selectionStart
        const lineStart = value.lastIndexOf('\n', s - 1) + 1
        const newText = value.slice(0, lineStart) + prefix + value.slice(lineStart)
        onChange(newText)
        requestAnimationFrame(() => {
            textareaRef.focus()
            textareaRef.setSelectionRange(s + prefix.length, s + prefix.length)
        })
    }

    return (
        <div className={cn('border rounded-lg overflow-hidden', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b px-2 py-1.5 bg-muted/30 gap-2 flex-wrap">
                {/* Format buttons — only active in write mode */}
                <div className="flex items-center gap-0.5">
                    <ToolButton title="Bold" onClick={() => wrap('**', '**')} disabled={mode === 'preview' || disabled}>
                        <Bold className="h-3.5 w-3.5" />
                    </ToolButton>
                    <ToolButton title="Italic" onClick={() => wrap('_', '_')} disabled={mode === 'preview' || disabled}>
                        <Italic className="h-3.5 w-3.5" />
                    </ToolButton>
                    <ToolButton title="Heading" onClick={() => wrapLine('## ')} disabled={mode === 'preview' || disabled}>
                        <Heading2 className="h-3.5 w-3.5" />
                    </ToolButton>
                    <ToolButton title="Bullet list" onClick={() => wrapLine('- ')} disabled={mode === 'preview' || disabled}>
                        <List className="h-3.5 w-3.5" />
                    </ToolButton>
                    <ToolButton title="Inline code" onClick={() => wrap('`', '`')} disabled={mode === 'preview' || disabled}>
                        <Code className="h-3.5 w-3.5" />
                    </ToolButton>
                    <ToolButton title="Link" onClick={() => wrap('[', '](url)')} disabled={mode === 'preview' || disabled}>
                        <LinkIcon className="h-3.5 w-3.5" />
                    </ToolButton>
                </div>

                {/* Write / Preview toggle */}
                <div className="flex items-center rounded-md border overflow-hidden text-xs">
                    <button
                        type="button"
                        onClick={() => setMode('write')}
                        className={cn(
                            'flex items-center gap-1 px-2.5 py-1 transition-colors',
                            mode === 'write'
                                ? 'bg-background text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Pencil className="h-3 w-3" /> Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={cn(
                            'flex items-center gap-1 px-2.5 py-1 transition-colors border-l',
                            mode === 'preview'
                                ? 'bg-background text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Eye className="h-3 w-3" /> Preview
                    </button>
                </div>
            </div>

            {/* Editor / Preview pane */}
            {mode === 'write' ? (
                <Textarea
                    ref={setTextareaRef}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    className="rounded-none border-0 focus-visible:ring-0 resize-none font-mono text-sm"
                />
            ) : (
                <div className="min-h-[120px] p-3">
                    {value.trim() ? (
                        <MarkdownContent content={value} />
                    ) : (
                        <p className="text-muted-foreground text-sm italic">Nothing to preview yet.</p>
                    )}
                </div>
            )}

            {/* Footer hint */}
            <div className="border-t px-3 py-1 bg-muted/20 text-xs text-muted-foreground">
                Supports <span className="font-medium">Markdown</span> — **bold**, _italic_, ## headings, - lists, `code`
            </div>
        </div>
    )
}

function ToolButton({ children, title, onClick, disabled }: {
    children: React.ReactNode
    title: string
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
            {children}
        </button>
    )
}
