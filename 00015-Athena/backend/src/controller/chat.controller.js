import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { titleAgent } from "../service/AI/title.agent.js"
import { findConversationByIdAndUserId, createConversation } from "../DAO/conversation.dao.js"



/**
 * Handle user message and generate AI response.
 * @type {import('express').RequestHandler}
 */
export const handleMessage = asyncHandler(async (request, response) => {

    const { content, conversationId } = request.body;

    let conversation = null;

    if (conversationId) {
        conversation = await findConversationByIdAndUserId(conversationId, request.user.id);
    }

    if (!conversation) {
        throw new AppError(404, 'Conversation not found');
    }

    if (!conversationId) {

        // Create a new conversation if no conversationId is provided
        const titleResponse = await titleAgent.invoke([
            { role: 'user', content: content }
        ])

        const title = titleResponse.structuredResponse.title;

        conversation = await createConversation({
            userId: request.user.id,
            title: title,
        })
    }

})