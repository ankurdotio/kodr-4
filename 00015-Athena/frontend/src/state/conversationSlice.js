import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    fetchConversations as requestConversations,
    fetchMessages as requestMessages,
    sendConversationMessage,
} from '../api/conversationApi.js'

function requestError(error) {
    return error.response?.data?.message ?? error.message ?? 'Something went wrong. Please try again.'
}

function normalizeMessage(message, conversationId) {
    return {
        role: message.role,
        content: message.content,
        id: message.id ?? message._id,
        conversationId,
    }
}

export const fetchConversations = createAsyncThunk(
    'conversation/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            return await requestConversations()
        } catch (error) {
            return rejectWithValue(requestError(error))
        }
    },
)

export const fetchConversationMessages = createAsyncThunk(
    'conversation/fetchMessages',
    async (conversationId, { rejectWithValue }) => {
        try {
            const messages = await requestMessages(conversationId)
            return { conversationId, messages: messages.map((message) => normalizeMessage(message, conversationId)) }
        } catch (error) {
            return rejectWithValue(requestError(error))
        }
    },
)

export const sendMessage = createAsyncThunk(
    'conversation/sendMessage',
    async ({ content, conversationId }, { dispatch, rejectWithValue, requestId }) => {
        try {
            const isTemporary = conversationId?.startsWith('local-')
            const result = await sendConversationMessage({
                content,
                conversationId: isTemporary ? null : conversationId,
                onToken(token) {
                    dispatch(appendAssistantToken({
                        conversationId: conversationId ?? `local-${requestId}`,
                        requestId,
                        token,
                    }))
                },
            })

            if (!result.conversationId) throw new Error('The server did not return a conversation ID.')
            if (!result.messageId) throw new Error('The server did not return an assistant message ID.')

            return { ...result, previousConversationId: isTemporary ? conversationId : null }
        } catch (error) {
            return rejectWithValue(requestError(error))
        }
    },
)

const initialState = {
    conversations: [],
    messages: {},
    currentChat: null,
    latestAiMessage: { content: null, id: null },
    activeStream: null,
    conversationsStatus: 'idle',
    messagesStatus: {},
    sendStatus: 'idle',
    error: null,
}

const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        clearConversationError(state) {
            state.error = null
        },
        appendAssistantToken(state, action) {
            const { conversationId, requestId, token } = action.payload
            if (state.activeStream?.requestId !== requestId
                || state.activeStream.conversationId !== conversationId) return

            state.latestAiMessage.content += token
        },
        startNewConversation(state) {
            state.currentChat = null
            state.error = null
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.conversationsStatus = 'loading'
                state.error = null
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                const pendingConversations = state.conversations.filter((item) => item.id.startsWith('local-'))
                state.conversations = [ ...action.payload
                    .map((conversation) => ({
                        id: conversation.id ?? conversation._id,
                        title: conversation.title,
                        lastMessageAt: conversation.lastMessageAt ?? conversation.updatedAt,
                    })), ...pendingConversations ]
                    .filter((conversation, index, items) => items.findIndex((item) => item.id === conversation.id) === index)
                    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                state.conversationsStatus = 'succeeded'
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.conversationsStatus = 'failed'
                state.error = action.payload
            })
            .addCase(fetchConversationMessages.pending, (state, action) => {
                state.currentChat = action.meta.arg
                state.messagesStatus[action.meta.arg] = 'loading'
                state.error = null
            })
            .addCase(fetchConversationMessages.fulfilled, (state, action) => {
                const { conversationId, messages } = action.payload
                state.messages[conversationId] = messages
                state.messagesStatus[conversationId] = 'succeeded'
            })
            .addCase(fetchConversationMessages.rejected, (state, action) => {
                state.messagesStatus[action.meta.arg] = 'failed'
                state.error = action.payload
            })
            .addCase(sendMessage.pending, (state, action) => {
                const { content, conversationId } = action.meta.arg
                const chatId = conversationId ?? `local-${action.meta.requestId}`

                state.currentChat = chatId
                state.sendStatus = 'loading'
                state.error = null
                if (!conversationId) {
                    state.conversations.unshift({
                        id: chatId,
                        title: content.trim().slice(0, 64) || 'New conversation',
                        lastMessageAt: new Date().toISOString(),
                    })
                } else {
                    const existingConversation = state.conversations.find((item) => item.id === chatId)
                    if (existingConversation) existingConversation.lastMessageAt = new Date().toISOString()
                    state.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                }
                const messages = state.messages[chatId] ?? (state.messages[chatId] = [])
                messages.push({
                    role: 'user',
                    content,
                    id: `${action.meta.requestId}-user`,
                    conversationId: chatId,
                })
                state.latestAiMessage = { content: '', id: null, conversationId: chatId }
                state.activeStream = { requestId: action.meta.requestId, conversationId: chatId }
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                const {
                    conversationId,
                    previousConversationId,
                    title,
                    userMessageId,
                    content,
                    messageId,
                } = action.payload
                const fromId = previousConversationId ?? conversationId
                const messages = state.messages[fromId] ?? []
                const userMessage = messages.find((message) => message.id === `${action.meta.requestId}-user`)
                const isCurrentStream = state.activeStream?.requestId === action.meta.requestId
                const assistantContent = isCurrentStream
                    ? state.latestAiMessage.content
                    : content

                if (previousConversationId) {
                    state.messages[conversationId] = messages
                    delete state.messages[previousConversationId]
                    if (state.currentChat === previousConversationId) state.currentChat = conversationId
                    const conversation = state.conversations.find((item) => item.id === previousConversationId)
                    if (conversation) {
                        conversation.id = conversationId
                        conversation.title = title || conversation.title
                    } else {
                        state.conversations.unshift({
                            id: conversationId,
                            title: title || 'New conversation',
                            lastMessageAt: new Date().toISOString(),
                        })
                    }
                }
                if (userMessage) {
                    userMessage.id = userMessageId || userMessage.id
                    userMessage.conversationId = conversationId
                }
                messages.push({
                    role: 'assistant',
                    content: assistantContent,
                    id: messageId,
                    conversationId,
                })
                if (isCurrentStream) {
                    state.latestAiMessage = { content: null, id: null, conversationId: null }
                    state.activeStream = null
                }
                state.sendStatus = 'succeeded'
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.sendStatus = 'failed'
                state.error = action.payload
                if (state.activeStream?.requestId === action.meta.requestId) {
                    state.latestAiMessage = { content: null, id: null, conversationId: null }
                    state.activeStream = null
                }
            })
    },
})

export const { appendAssistantToken, clearConversationError, startNewConversation } = conversationSlice.actions
export const selectConversation = (state) => state.conversation
export default conversationSlice.reducer
