import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTitle } from "../service/AI/title.agent.js"
import { findConversationByIdAndUserId, createConversation, findConversationsByUserId } from "../DAO/conversation.dao.js"
import { findMessagesByConversationId } from "../DAO/message.dao.js"
import { HumanMessage, AIMessage, ToolMessage } from "langchain"
import graph from "../service/AI/graph/main.graph.js"
import { createUserMessage } from "../DAO/message.dao.js"



/**
 * Handle user message and generate AI response.
 * @type {import('express').RequestHandler}
 */
export const handleMessage = asyncHandler(async (request, response) => {

    const { content, conversationId } = request.body;

    let conversation = null;

    if (conversationId) {
        conversation = await findConversationByIdAndUserId(conversationId, request.user.id);
        if (!conversation) {
            throw new AppError(404, 'Conversation not found');
        }
    }



    if (!conversationId) {

        // Create a new conversation if no conversationId is provided


        const title = await generateTitle(content)

        conversation = await createConversation({
            userId: request.user.id,
            title: title,
        })
    }

    const messages = (conversationId ? await findMessagesByConversationId(conversationId) : []).map(
        message => {
            if (message.role === "user") {
                return new HumanMessage(message.content)
            }

            if (message.role === "assistant") {
                return new AIMessage({
                    content: message.content,
                    tool_calls: message.toolCalls.map(toolCall => {
                        return {
                            name: toolCall.toolName,
                            args: toolCall.arguments,
                            id: toolCall.tool_id
                        }
                    })
                })
            }

            if (message.role === "tool") {
                return new ToolMessage({
                    content: message.content,
                    tool_call_id: message.tool_call_id
                })
            }
        }
    )

    messages.push(new HumanMessage(content))

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    response.setHeader("Conversation-Id", conversation._id.toString());
    response.setHeader("Conversation-title", conversation.title);
    response.setHeader("Access-Control-Expose-Headers", "Conversation-Id, Conversation-title");


    await createUserMessage({
        conversationId: conversation._id.toString(),
        content: content
    })

    const result = await graph.invoke({
        messages: messages,
        conversationId: conversation._id.toString(),
        onToken: (token) => {

            response.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
    })

    response.end()

})


/**
 * Get all the Conversation of the current User
 * @type {import('express').RequestHandler}
 */
export const getConversation = asyncHandler(async (req, res) => {
    const user = req.user

    const conversations = await findConversationsByUserId(user.id)

    return sendSuccess(res, 200, "Conversation fetched Successfully", {
        conversations
    })
})