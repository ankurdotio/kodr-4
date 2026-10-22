import { apiClient } from './client.js'

function unwrap(response) {
    return response.data.data
}

export async function fetchConversations() {
    return unwrap(await apiClient.get('/chat')).conversations
}

export async function fetchMessages(conversationId) {
    return unwrap(await apiClient.get(`/chat/${encodeURIComponent(conversationId)}/messages`)).messages
}

function parseEvent(event) {
    const data = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n')

    return data ? JSON.parse(data) : null
}

async function readStream(stream, onToken) {
    let content = ''
    let id = null
    let pendingEvent = ''
    const decoder = new TextDecoder()
    const reader = stream.getReader()

    function consumeEvent(event) {
        const payload = parseEvent(event)
        if (!payload) return
        if (typeof payload.token === 'string') {
            content += payload.token
            onToken?.(payload.token)
        }
        if (typeof payload.id === 'string') id = payload.id
        if (payload.error) throw new Error(payload.error)
    }

    try {
        while (true) {
            const { done, value } = await reader.read()
            pendingEvent += done ? decoder.decode() : decoder.decode(value, { stream: true })

            const events = pendingEvent.split(/\r?\n\r?\n/)
            pendingEvent = events.pop() ?? ''
            for (const event of events) consumeEvent(event)

            if (done) {
                if (pendingEvent.trim()) consumeEvent(pendingEvent)
                break
            }
        }

        return { content, id }
    } finally {
        reader.releaseLock()
    }
}

export async function sendConversationMessage({ content, conversationId, onToken }) {
    const response = await apiClient.post(
        '/chat',
        { content, ...(conversationId && { conversationId }) },
        {
            adapter: 'fetch',
            responseType: 'stream',
        },
    )
    const { content: answer, id: messageId } = await readStream(response.data, onToken)

    return {
        conversationId: response.headers['conversation-id'],
        title: response.headers['conversation-title'],
        userMessageId: response.headers['user-message-id'],
        content: answer,
        messageId,
    }
}
