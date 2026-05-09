import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
    content: string
    className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children, className }) => {
                    const isBlock = className?.includes('language-')
                    return isBlock
                        ? <code className="block bg-muted rounded-md px-3 py-2 text-sm font-mono overflow-x-auto my-2">{children}</code>
                        : <code className="bg-muted rounded px-1 py-0.5 text-sm font-mono">{children}</code>
                },
                pre: ({ children }) => <pre className="bg-muted rounded-md p-3 overflow-x-auto my-2 text-sm">{children}</pre>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-orange-500/40 pl-4 italic text-muted-foreground my-3">
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                        {children}
                    </a>
                ),
                hr: () => <hr className="my-4 border-border" />,
            }}
        >
            {content}
        </ReactMarkdown>
        </div>
    )
}
