import { EventModel } from '../models/event.model.js';

/** Idempotently persist a verified delivery summary.
 * @param {object} event Sanitized event summary.
 * @returns {Promise<object|null>} Persisted event.
 */
export async function recordEvent(event) {
  return EventModel.findOneAndUpdate(
    { deliveryId: event.deliveryId }, { $setOnInsert: event }, { upsert: true, new: true },
  ).lean();
}

/** Read the latest deliveries visible to an installation.
 * @param {number} installationId Installation ID.
 * @returns {Promise<object[]>} Latest 50 summaries.
 */
export async function listEvents(installationId) {
  return EventModel.find({ installationId }).sort({ receivedAt: -1 }).limit(50).lean();
}
