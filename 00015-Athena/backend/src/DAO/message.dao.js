import messageModel from '../models/message.model.js';

/**
 * Creates a new user message in the database.
 * @param {{conversationId: import('mongoose').Types.ObjectId | string, content: string}} input - The input data for the new message.
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>>} - The newly created message document.
 * @throws {Error} - If there is an error while creating the message.
 */
export async function createUserMessage(input) {
    const message = await messageModel.create({
        conversationId: input.conversationId,
        role: "user",
        content: input.content,
        status: 'completed',
    });
    return message;
}

/**
 * Create a new assistant message in the database.
 * @param {{conversationId: import('mongoose').Types.ObjectId | string, content: string, model?: string, toolCalls?: { toolName: string, arguments: any, tool_id: string }[], inputTokens?: number, outputTokens?: number, model?: string}} input - The input data for the new message.
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>>} - The newly created message document.
 */

export async function createAssistantMessage(input) {
    const message = await messageModel.create({
        conversationId: input.conversationId,
        role: "assistant",
        content: input.content,
        status: 'completed',
        model: input.model,
        toolCalls: input.toolCalls,
        usage: {
            inputTokens: input.inputTokens,
            outputTokens: input.outputTokens,
        },
        model: input.model
    });
    return message;
}



/**
 * Create a new tool message in the database.
 * @param {{conversationId: import('mongoose').Types.ObjectId | string, content: string, toolName: string, tool_id: string}} input - The input data for the new message.
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>>} - The newly created message document.
 */
export async function createToolMessage(input) {
    const message = await messageModel.create({
        conversationId: input.conversationId,
        role: "tool",
        content: input.content,
        status: 'completed',
        toolName: input.toolName,
        tool_call_id: input.tool_id,
    });
    return message;
}


/**
 * Find all the messages for a given conversation ID.
 * @param {string} conversationId - The ID of the conversation to find messages for.
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>[]>} - An array of message documents for the given conversation ID.
 */
export async function findMessagesByConversationId(conversationId) {
    return messageModel.find({ conversationId })
}

/**
 * Find user and AI messages to show on the frontend by a conversationId
* @param {string} conversationId - The ID of the conversation to find messages for.
* @returns {Promise<import('mongoose').HydratedDocument<unknown>[]>} - An array of message documents for the given conversation ID.
 */
export async function findUserAndAssistantMessageByConversationId(conversationId) {
    return messageModel.find({
        conversationId,
        role: {
            $in: [ "user", "assistant" ]
        },
        content: {
            $ne: ""
        }
    })
}