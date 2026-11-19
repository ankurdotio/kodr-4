import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  refreshToken: { type: String, select: false, default: null },
  installationId: { type: Number, default: null, index: true },
  installationStatus: { type: String, enum: ['pending', 'active', 'suspended', 'removed'], default: 'pending' },
  installationAccount: { type: String, default: '' },
}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);
