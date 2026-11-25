import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userInput: { type: String, required: true },
  repo: {
    id: { type: Number, required: true },
    htmlUrl: { type: String, required: true },
    fullName: { type: String, required: true },
    defaultBranch: { type: String, required: true },
  },
  installationId: { type: Number, required: true },
  status: {
    type: String, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending',
  },
  pullRequestUrl: { type: String, default: null },
  error: { type: String, default: null },
  cleanupPending: { type: Boolean, default: true },
  state: { type: Object, default: {}, select: false },
}, { timestamps: true });

taskSchema.index({ cleanupPending: 1, createdAt: 1 });
export default mongoose.model('Task', taskSchema);
