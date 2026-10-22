import { forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  ArrowUp,
  ChevronDown,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth.js'
import {
  clearConversationError,
  fetchConversationMessages,
  fetchConversations,
  sendMessage,
  startNewConversation,
} from '../../state/conversationSlice.js'
import Brand from '../components/Brand.jsx'

const MarkdownMessage = lazy(() => import('../components/MarkdownMessage.jsx'))
const EMPTY_MESSAGES = []
const suggestions = [
  'Help me brainstorm ideas',
  'Explain a concept simply',
  'Draft something thoughtful',
]

function groupConversations(conversations) {
  const today = new Date().toDateString()
  const recent = new Date()
  recent.setDate(recent.getDate() - 7)

  return [
    { label: 'Today', items: conversations.filter((item) => new Date(item.lastMessageAt).toDateString() === today) },
    {
      label: 'Previous 7 days',
      items: conversations.filter((item) => {
        const date = new Date(item.lastMessageAt)
        return date.toDateString() !== today && date >= recent
      }),
    },
    {
      label: 'Older',
      items: conversations.filter((item) => new Date(item.lastMessageAt) < recent),
    },
  ].filter((group) => group.items.length)
}

function ConversationSidebar({ open, onClose, onNewConversation }) {
  const dispatch = useDispatch()
  const { user, logout, isSubmitting } = useAuth()
  const conversations = useSelector((state) => state.conversation.conversations)
  const currentChat = useSelector((state) => state.conversation.currentChat)
  const conversationsStatus = useSelector((state) => state.conversation.conversationsStatus)
  const [ search, setSearch ] = useState('')
  const filteredConversations = conversations.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  )

  function openConversation(id) {
    dispatch(fetchConversationMessages(id))
    onClose()
  }

  return (
    <aside className={`${open ? 'flex' : 'hidden md:flex'} fixed inset-y-0 left-0 z-20 w-[286px] shrink-0 flex-col border-r border-[#e6e8e2] bg-[#f8f9f6] md:static`}>
      <div className="flex items-center justify-between px-5 pb-7 pt-6">
        <Brand />
        <button
          aria-label="Close conversation list"
          className="grid size-9 place-items-center rounded-lg text-[#68736c] hover:bg-[#ecefe9] md:hidden"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-4">
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#225b46] text-sm font-semibold text-white shadow-sm transition hover:bg-[#194a38]"
          onClick={onNewConversation}
          type="button"
        >
          <Plus size={17} />
          New conversation
        </button>
        <label className="mt-4 flex h-10 items-center gap-2.5 rounded-xl border border-[#e5e8e2] bg-white px-3 text-[#89928b] focus-within:border-[#a8b9ab]">
          <Search size={16} />
          <input
            aria-label="Search conversations"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#28342d] outline-none placeholder:text-[#939b95]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            value={search}
          />
          <span className="rounded border border-[#e5e8e2] px-1.5 py-0.5 text-[10px] text-[#9aa19c]">⌘ K</span>
        </label>
      </div>

      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-3 pb-5">
        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#939b95]">
          Your conversations
        </p>
        {conversationsStatus === 'loading' && conversations.length === 0 ? (
          <p className="px-2 py-3 text-sm text-[#89928b]">Loading conversations…</p>
        ) : filteredConversations.length === 0 ? (
          <p className="px-2 py-3 text-sm leading-6 text-[#89928b]">
            {search ? 'No conversations match your search.' : 'Your conversations will appear here.'}
          </p>
        ) : (
          groupConversations(filteredConversations).map((group) => (
            <section className="mb-5" key={group.label}>
              <h2 className="mb-1 px-2 text-xs font-medium text-[#98a099]">{group.label}</h2>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      aria-current={currentChat === item.id ? 'page' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[13px] transition ${
                        currentChat === item.id
                          ? 'bg-[#e9eee8] font-medium text-[#234d3a]'
                          : 'text-[#566159] hover:bg-[#eef0eb]'
                      }`}
                      onClick={() => openConversation(item.id)}
                      type="button"
                    >
                      <MessageSquare className="shrink-0 opacity-65" size={15} strokeWidth={1.8} />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <div className="border-t border-[#e6e8e2] p-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[#eef0eb]" type="button">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dfe8df] text-sm font-semibold text-[#315843]">
            {user?.name?.slice(0, 1)?.toUpperCase() ?? 'A'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[#26352c]">{user?.name ?? 'Athena user'}</span>
            <span className="block truncate text-xs text-[#8a938c]">{user?.email}</span>
          </span>
          <ChevronDown size={16} className="text-[#89928b]" />
        </button>
        <button
          className="mt-1 w-full rounded-lg px-2 py-2 text-left text-xs text-[#6f7972] transition hover:bg-[#eef0eb] hover:text-[#26352c] disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => logout()}
          type="button"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

function ConversationHeader({ onOpenSidebar }) {
  const currentChat = useSelector((state) => state.conversation.currentChat)
  const conversations = useSelector((state) => state.conversation.conversations)
  const title = conversations.find((item) => item.id === currentChat)?.title

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#eff0ec] px-5 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open conversation list"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-[#66736a] hover:bg-[#f3f5f1] md:hidden"
          onClick={onOpenSidebar}
          type="button"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#3a473f]">{title || 'Athena'}</p>
          <p className="mt-0.5 text-[11px] text-[#929b94]">A thoughtful space to work things out</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-[#e9ece7] bg-[#fbfcfa] px-3 py-1.5 text-xs text-[#66736a]">
        <Sparkles size={13} className="text-[#528069]" />
        Athena
      </div>
    </header>
  )
}

function ConversationMessages({ conversationId, scrollTargetRef }) {
  const messages = useSelector((state) => state.conversation.messages[conversationId] ?? EMPTY_MESSAGES)

  useEffect(() => {
    scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [ messages.length, scrollTargetRef ])

  return messages.map((message) => (
    <article className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`} key={message.id}>
      {message.role === 'assistant' && (
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#e8eee7] text-[#315843]">
          <Sparkles size={15} />
        </span>
      )}
      <div className={message.role === 'user'
        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-[#f1f3ef] px-5 py-3.5 text-[14px] leading-7 text-[#344239] sm:max-w-[75%]'
        : 'min-w-0 flex-1 pt-0.5 text-[14px] leading-7 text-[#344239]'}>
        {message.content
          ? <Suspense fallback={<p>{message.content}</p>}><MarkdownMessage content={message.content} /></Suspense>
          : <span className="inline-flex items-center gap-2 text-sm text-[#879188]"><span className="size-1.5 animate-pulse rounded-full bg-[#5b866c]" />Thinking…</span>}
      </div>
    </article>
  ))
}

function LatestAssistantMessage({ conversationId, scrollTargetRef }) {
  const latestAiMessage = useSelector((state) => state.conversation.latestAiMessage)
  const isLatestForConversation = latestAiMessage.conversationId === conversationId
    && latestAiMessage.content !== null

  useEffect(() => {
    if (!isLatestForConversation) return
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [ isLatestForConversation, latestAiMessage.content, scrollTargetRef ])

  if (!isLatestForConversation) return null

  return (
    <article className="flex gap-4">
      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#e8eee7] text-[#315843]">
        <Sparkles size={15} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5 text-[14px] leading-7 text-[#344239]">
        {latestAiMessage.content
          ? <Suspense fallback={<p>{latestAiMessage.content}</p>}><MarkdownMessage content={latestAiMessage.content} /></Suspense>
          : <span className="inline-flex items-center gap-2 text-sm text-[#879188]"><span className="size-1.5 animate-pulse rounded-full bg-[#5b866c]" />Thinking…</span>}
      </div>
    </article>
  )
}

function ConversationLoadingState({ conversationId }) {
  const status = useSelector((state) => state.conversation.messagesStatus[conversationId])
  const messages = useSelector((state) => state.conversation.messages[conversationId] ?? EMPTY_MESSAGES)
  if (status !== 'loading' || messages.length > 0) return null

  return <p className="py-16 text-center text-sm text-[#879188]">Loading this conversation…</p>
}

function ConversationLoadError({ conversationId }) {
  const status = useSelector((state) => state.conversation.messagesStatus[conversationId])
  if (status !== 'failed') return null

  return <p className="text-center text-sm text-[#a14838]">Unable to load this conversation. Please try again.</p>
}

function WelcomeMessage({ onSuggestion }) {
  return (
    <div className="flex h-full min-h-[390px] flex-col items-center justify-center pb-8 text-center">
      <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-[#edf2eb] text-[#386249]">
        <Sparkles size={22} strokeWidth={1.7} />
      </span>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#66816c]">A little room to think</p>
      <h1 className="font-serif text-[34px] font-normal tracking-[-0.035em] text-[#26372d] sm:text-[42px]">
        What would you like to explore?
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#818b83]">
        Ask a question, explore an idea, or work through something complex. We can take it one step at a time.
      </p>
      <div className="mt-8 flex max-w-xl flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            className="rounded-full border border-[#e7ebe5] bg-white px-4 py-2 text-xs text-[#68766c] transition hover:border-[#c4d2c4] hover:bg-[#f7f9f6]"
            key={suggestion}
            onClick={() => onSuggestion(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

function ConversationPanel({ onSuggestion }) {
  const currentChat = useSelector((state) => state.conversation.currentChat)
  const scrollTargetRef = useRef(null)

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-5">
      {currentChat ? (
        <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8 py-10 sm:py-12">
          <ConversationLoadingState conversationId={currentChat} />
          <ConversationMessages conversationId={currentChat} scrollTargetRef={scrollTargetRef} />
          <LatestAssistantMessage conversationId={currentChat} scrollTargetRef={scrollTargetRef} />
          <ConversationLoadError conversationId={currentChat} />
          <div ref={scrollTargetRef} />
        </div>
      ) : (
        <WelcomeMessage onSuggestion={onSuggestion} />
      )}
    </section>
  )
}

const ConversationComposer = forwardRef(function ConversationComposer(_props, ref) {
  const dispatch = useDispatch()
  const currentChat = useSelector((state) => state.conversation.currentChat)
  const sendStatus = useSelector((state) => state.conversation.sendStatus)
  const error = useSelector((state) => state.conversation.error)
  const [ messageInput, setMessageInput ] = useState('')
  const textareaRef = useRef(null)
  const isSending = sendStatus === 'loading'

  useImperativeHandle(ref, () => ({
    setMessage(message) {
      setMessageInput(message)
      textareaRef.current?.focus()
    },
    clear() {
      setMessageInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    },
  }), [])

  function handleSubmit(event) {
    event.preventDefault()
    const content = messageInput.trim()
    if (!content || isSending) return

    dispatch(sendMessage({ content, conversationId: currentChat }))
    setMessageInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    dispatch(clearConversationError())
  }

  function handleInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <footer className="shrink-0 px-4 pb-5 pt-3 sm:px-8 sm:pb-7">
      <div className="mx-auto max-w-[800px]">
        {error && (
          <p className="mb-3 rounded-lg bg-[#fff3f0] px-4 py-2.5 text-sm text-[#a14838]" role="alert">
            {error}
          </p>
        )}
        <form
          className="rounded-2xl border border-[#e4e8e2] bg-white p-3 shadow-[0_5px_24px_rgba(41,58,47,0.07)] transition focus-within:border-[#b8c8b9] focus-within:shadow-[0_5px_28px_rgba(41,58,47,0.1)]"
          onSubmit={handleSubmit}
        >
          <textarea
            aria-label="Message Athena"
            className="max-h-40 min-h-10 w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-[#344239] outline-none placeholder:text-[#9aa29c]"
            onChange={(event) => {
              setMessageInput(event.target.value)
              event.target.style.height = 'auto'
              event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Message Athena…"
            ref={textareaRef}
            rows={1}
            value={messageInput}
          />
          <div className="flex items-center justify-between pl-2 pt-1">
            <span className="text-[11px] text-[#a0a7a1]">Shift + Enter for a new line</span>
            <button
              aria-label="Send message"
              className="grid size-9 place-items-center rounded-xl bg-[#225b46] text-white transition hover:bg-[#194a38] disabled:cursor-not-allowed disabled:bg-[#d6ddd6]"
              disabled={!messageInput.trim() || isSending}
              type="submit"
            >
              <ArrowUp size={18} strokeWidth={2.1} />
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-[10px] text-[#a1a8a2]">Athena can make mistakes. Consider checking important information.</p>
      </div>
    </footer>
  )
})

export default function DashboardPage() {
  const dispatch = useDispatch()
  const [ sidebarOpen, setSidebarOpen ] = useState(false)
  const composerRef = useRef(null)

  useEffect(() => {
    dispatch(fetchConversations())
  }, [ dispatch ])

  function handleNewConversation() {
    dispatch(startNewConversation())
    composerRef.current?.clear()
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen min-h-[560px] overflow-hidden bg-[#fff] text-[#25332b]">
      <ConversationSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={handleNewConversation}
      />
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <ConversationHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="flex min-h-0 flex-1 flex-col">
          <ConversationPanel onSuggestion={(message) => composerRef.current?.setMessage(message)} />
          <ConversationComposer ref={composerRef} />
        </div>
      </main>
    </div>
  )
}
