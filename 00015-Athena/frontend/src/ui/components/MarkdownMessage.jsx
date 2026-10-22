import { lazy, Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MarkdownCodeBlock = lazy(() => import('./MarkdownCodeBlock.jsx'))

export default function MarkdownMessage({ content }) {
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[ remarkGfm ]}
                components={{
                    code({ className, children }) {
                        const language = /language-(\w+)/.exec(className ?? '')?.[1]
                        if (!language) return <code className={className}>{children}</code>

                        return (
                            <Suspense fallback={<pre><code className={className}>{children}</code></pre>}>
                                <MarkdownCodeBlock language={language} code={String(children).replace(/\n$/, '')} />
                            </Suspense>
                        )
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
