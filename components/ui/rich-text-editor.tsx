'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'
import {
    Bold, Italic, List, ListOrdered,
    Heading2, Heading3, Link as LinkIcon,
    Undo, Redo, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

function ToolbarBtn({
    onClick, active, disabled, title, children,
}: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
            disabled={disabled}
            title={title}
            className={cn(
                'p-1.5 rounded transition-colors',
                active
                    ? 'bg-orange-500 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                disabled && 'opacity-40 cursor-not-allowed',
            )}
        >
            {children}
        </button>
    )
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write something…',
    className,
    minHeight = '140px',
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
            }),
            Placeholder.configure({ placeholder }),
            Link.configure({ openOnClick: false, autolink: true }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-sm dark:prose-invert max-w-none p-3',
                style: `min-height: ${minHeight}`,
            },
        },
        onUpdate({ editor }) {
            onChange(editor.isEmpty ? '' : editor.getHTML())
        },
        immediatelyRender: false,
    })

    // Sync external reset
    useEffect(() => {
        if (!editor) return
        if (value === '' && !editor.isEmpty) editor.commands.clearContent()
    }, [value, editor])

    const addLink = () => {
        const url = window.prompt('Enter URL')
        if (!url || !editor) return
        editor.chain().focus().setLink({ href: url }).run()
    }

    if (!editor) return null

    return (
        <div className={cn('rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring', className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
                <ToolbarBtn title="Bold (⌘B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                    <Bold className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn title="Italic (⌘I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                    <Italic className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <div className="w-px h-4 bg-border mx-1" />

                <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
                    <Heading2 className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
                    <Heading3 className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <div className="w-px h-4 bg-border mx-1" />

                <ToolbarBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
                    <List className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
                    <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn title="Add link" onClick={addLink} active={editor.isActive('link')}>
                    <LinkIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>

                <div className="w-px h-4 bg-border mx-1" />

                <ToolbarBtn title="Undo (⌘Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <Undo className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn title="Redo (⌘⇧Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <Redo className="h-3.5 w-3.5" />
                </ToolbarBtn>
            </div>

            {/* Content area */}
            <EditorContent editor={editor} className="bg-background text-foreground text-sm" />
        </div>
    )
}
