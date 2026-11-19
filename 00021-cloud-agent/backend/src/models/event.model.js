import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  deliveryId: { type: String, required: true, unique: true },
  installationId: { type: Number, default: null, index: true },
  event: { type: String, required: true },
  action: { type: String, default: '' },
  actor: { type: String, default: '' },
  repository: { type: String, default: '' },
  receivedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});
eventSchema.index({ installationId: 1, receivedAt: -1 });

export const EventModel = mongoose.model('Event', eventSchema);
