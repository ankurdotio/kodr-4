import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const shareSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            default: () => randomBytes(16).toString('base64url').slice(0, 21),
            minlength: 21,
            maxlength: 21,
        },
        createdAt: { type: Date, required: true, default: Date.now },
    },
    { _id: false },
);

const conversationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, maxlength: 80 },
        titleSource: { type: String, enum: [ 'placeholder', 'ai', 'user' ], default: 'placeholder' },
        model: { type: String, enum: env.bedrockModelAllowList, default: env.bedrockDefaultModel },
        lastMessageAt: { type: Date, required: true, default: Date.now },
        generatingSince: { type: Date, default: Date.now },
        isPinned: { type: Boolean, default: false },
        share: { type: shareSchema, default: undefined },
    },
    { timestamps: true },
);

conversationSchema.index({ userId: 1, isPinned: -1, lastMessageAt: -1 });
conversationSchema.index(
    { 'share.id': 1 },
    {
        unique: true,
        partialFilterExpression: { 'share.id': { $type: 'string' } },
    },
);

const ConversationModel = mongoose.model('Conversation', conversationSchema);

export default ConversationModel;