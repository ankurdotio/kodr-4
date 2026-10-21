import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const customInstructionsSchema = new mongoose.Schema(
    {
        aboutMe: { type: String, default: '', maxlength: 1500 },
        responseStyle: { type: String, default: '', maxlength: 1500 },
    },
    { _id: false },
);

const preferencesSchema = new mongoose.Schema(
    {
        theme: { type: String, enum: [ 'light', 'dark', 'system' ], default: 'system' },
        defaultModel: {
            type: String,
            enum: env.bedrockModelAllowList,
            default: env.bedrockDefaultModel,
        },
        customInstructions: { type: customInstructionsSchema, default: () => ({}) },
    },
    { _id: false },
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
        email: { type: String, required: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        avatarUrl: { type: String, default: undefined },
        preferences: { type: preferencesSchema, default: () => ({}) },
    },
    { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;