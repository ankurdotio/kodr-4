import mongoose from 'mongoose';
import { env } from '../config/env.js';

const sessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        tokenHash: {
            type: String,
            required: true,
            match: /^[a-f\d]{64}$/i,
        },
        userAgent: { type: String, default: '' },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + env.refreshTokenTtl * 1000),
        },
        revokedAt: { type: Date, default: null },
        replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
    },
    { timestamps: true },
);

sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SessionModel = mongoose.model('Session', sessionSchema);

export default SessionModel;