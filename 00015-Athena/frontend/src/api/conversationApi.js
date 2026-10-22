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

function readStream(stream) {
    let content = ''
    let id = null

    for (const event of stream.split(/\r?\n\r?\n/)) {
        const payload = parseEvent(event)
        if (!payload) continue
        if (typeof payload.token === 'string') content += payload.token
        if (typeof payload.id === 'string') id = payload.id
        if (payload.error) throw new Error(payload.error)
    }

    return { content, id }
}

export async function sendConversationMessage({ content, conversationId, onToken }) {
    let responseLength = 0
    let pendingEvent = ''
    const response = await apiClient.post(
        '/chat',
        { content, ...(conversationId && { conversationId }) },
        {
            responseType: 'text',
            onDownloadProgress({ event }) {
                const responseText = event?.currentTarget?.responseText ?? ''
                const delta = responseText.slice(responseLength)
                responseLength = responseText.length
                const events = `${pendingEvent}${delta}`.split(/\r?\n\r?\n/)
                pendingEvent = events.pop() ?? ''

                for (const item of events) {
                    const payload = parseEvent(item)
                    if (typeof payload?.token === 'string') onToken?.(payload.token)
                }
            },
        },
    )
    const { content: answer, id: messageId } = readStream(response.data)

    return {
        conversationId: response.headers['conversation-id'],
        title: response.headers['conversation-title'],
        userMessageId: response.headers['user-message-id'],
        content: answer,
        messageId,
    }
}
