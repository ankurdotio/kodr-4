import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('markup', markup)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('tsx', tsx)

const languageAliases = { html: 'markup', js: 'javascript', sh: 'bash', shell: 'bash', ts: 'typescript', xml: 'markup' }
const supportedLanguages = new Set([ 'bash', 'css', 'javascript', 'json', 'jsx', 'markup', 'python', 'tsx', 'typescript' ])

export default function MarkdownCodeBlock({ language: declaredLanguage, code }) {
    const language = languageAliases[declaredLanguage] ?? declaredLanguage
    if (!supportedLanguages.has(language)) {
        return <pre><code className={`language-${declaredLanguage}`}>{code}</code></pre>
    }

    return (
        <SyntaxHighlighter
            language={language}
            style={oneDark}
            PreTag="div"
            customStyle={{ margin: '1rem 0', borderRadius: '0.75rem', fontSize: '0.85rem' }}
        >
            {code}
        </SyntaxHighlighter>
    )
}
