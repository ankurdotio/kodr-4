import mongoose from 'mongoose';
import ConversationModel from '../models/conversation.model.js';
import MessageModel from '../models/message.model.js';

/** Create a user message before its conversation so no empty conversation is persisted.
 * @param {{userId: import('mongoose').Types.ObjectId | string, content: string, model?: string}} input
 * @returns {Promise<{conversation: import('mongoose').HydratedDocument<unknown>, firstMessage: import('mongoose').HydratedDocument<unknown>}>}
 */
export async function createConversationWithFirstMessage(input) {
    const conversationId = new mongoose.Types.ObjectId();
    const firstMessage = new MessageModel({
        conversationId,
        userId: input.userId,
        role: 'user',
        content: input.content,
        status: 'completed',
    });

    await firstMessage.save();

    try {
        const conversation = new ConversationModel({
            _id: conversationId,
            userId: input.userId,
            title: input.content.trim().slice(0, 80),
            titleSource: 'placeholder',
            ...(input.model && { model: input.model }),
            lastMessageAt: firstMessage.createdAt,
            generatingSince: new Date(),
        });
        await conversation.save();
        return { conversation, firstMessage };
    } catch (error) {
        try {
            await ConversationModel.deleteOne({ _id: conversationId }).exec();
            await MessageModel.deleteOne({ _id: firstMessage._id }).exec();
        } catch {
            // Keep the first message if compensation fails so a saved conversation remains valid.
        }
        throw error;
    }
}

/**
 * Find a conversation by its identifier and user ownership.
 * @param {string} conversationId
 * @param {string} userId
 * @return {Promise<import('mongoose').HydratedDocument<unknown> | null>}
 */
export async function findConversationByIdAndUserId(conversationId, userId) {
    return ConversationModel.findOne({ _id: conversationId, userId });
}

/**
 * Find all the conversation by the userId
 * @param {string} userId
 * @return {Promise<import('mongoose').HydratedDocument<unknown> | null>[]}
 */
export async function findConversationsByUserId(userId) {
    return await ConversationModel.find({ userId })
}



/**
 * Create a conversation
 * @param {{userId: import('mongoose').Types.ObjectId | string, title: string}} input
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>>}
 */
export async function createConversation(input) {
    const conversation = new ConversationModel({
        userId: input.userId,
        title: input.title,
        titleSource: 'ai',
        lastMessageAt: new Date(),
    });
    await conversation.save();
    return conversation;
}