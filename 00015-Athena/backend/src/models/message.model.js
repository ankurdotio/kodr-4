import mongoose from 'mongoose';
import { env } from '../config/env.js';

const errorSchema = new mongoose.Schema(
    {
        code: { type: String, required: true },
        message: { type: String, required: true },
    },
    { _id: false },
);

const usageSchema = new mongoose.Schema(
    {
        inputTokens: { type: Number, min: 0 },
        outputTokens: { type: Number, min: 0 },
    },
    { _id: false },
);

const latencySchema = new mongoose.Schema(
    {
        firstToken: { type: Number, min: 0 },
        total: { type: Number, min: 0 },
    },
    { _id: false },
);

const sourceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        url: { type: String, required: true },
    },
    { _id: false },
);

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: [ 'user', 'assistant' ], required: true },
        content: {
            type: String,
            required: true,
            default: '',
            validate: {
                validator(value) {
                    return this.role !== 'user'
                        || (typeof value === 'string' && value.length >= 1 && value.length <= 8000);
                },
                message: 'User messages must contain between 1 and 8,000 characters',
            },
        },
        status: { type: String, enum: [ 'streaming', 'completed', 'stopped', 'error' ], default: 'streaming' },
        model: { type: String, enum: env.bedrockModelAllowList, default: undefined },
        finishReason: { type: String, enum: [ 'stop', 'length', 'aborted', 'error', null ], default: null },
        usage: { type: usageSchema, default: undefined },
        latencyMs: { type: latencySchema, default: undefined },
        error: { type: errorSchema, default: null },
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
        attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
        sources: { type: [ sourceSchema ], default: undefined },
        feedback: { type: String, enum: [ 'up', 'down', null ], default: null },
    },
    { timestamps: true },
);

messageSchema.pre('validate', function enforceRoleRules() {
    if (this.role === 'user') {
        this.status = 'completed';
        this.model = undefined;
    }

    if (this.role === 'assistant' && !this.model) {
        this.invalidate('model', 'Assistant messages require a model ID');
    }

    if (this.status === 'error' && !this.error) {
        this.invalidate('error', 'Error messages require error details');
    }

    if (this.status !== 'error') {
        this.error = null;
    }
});

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, content: 'text' });

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;