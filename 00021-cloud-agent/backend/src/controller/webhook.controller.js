import { env } from '../config/env.js';
import { recordEvent, listEvents } from '../DAO/event.dao.js';
import { updateInstallationStatus } from '../DAO/user.dao.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { verifyWebhookSignature } from '../utils/webhook.js';

/** Accept a signed delivery and persist only a non-sensitive summary.
 * @param {import('express').Request} req Webhook request with rawBody.
 * @param {import('express').Response} res Response.
 * @returns {Promise<import('express').Response>} Delivery acknowledgment.
 * @throws {AppError} If signature or delivery metadata is invalid.
 */
export async function githubEvent(req, res) {
  verifyWebhookSignature(req.rawBody, req.get('x-hub-signature-256'), env.githubWebhookSecret);
  const deliveryId = req.get('x-github-delivery');
  const event = req.get('x-github-event');
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(deliveryId || '') || !/^[a-z_]{1,100}$/.test(event || '')) {
    throw new AppError(400, 'Invalid webhook delivery headers');
  }
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new AppError(400, 'Invalid webhook payload');
  const installationId = payload.installation?.id;
  if (installationId !== undefined && (!Number.isSafeInteger(installationId) || installationId <= 0)) {
    throw new AppError(400, 'Invalid installation ID');
  }
  if (event === 'installation' && String(payload.installation?.app_id) !== env.githubAppId) {
    throw new AppError(400, 'Unexpected GitHub App');
  }
  const clean = value => typeof value === 'string' ? value.slice(0, 256) : '';
  await recordEvent({
    deliveryId, event, installationId: installationId || null,
    action: clean(payload.action), actor: clean(payload.sender?.login),
    repository: clean(payload.repository?.full_name),
  });
  if (event === 'installation') {
    const states = { deleted: 'removed', suspend: 'suspended', unsuspend: 'active' };
    if (states[payload.action]) await updateInstallationStatus(installationId, states[payload.action]);
  }
  return sendSuccess(res, 200, 'Webhook received', { deliveryId });
}

/** Return deliveries only for the authenticated user's active installation.
 * @param {import('express').Request} req Authenticated request.
 * @param {import('express').Response} res Response.
 * @returns {Promise<import('express').Response>} Delivery summaries.
 */
export async function activity(req, res) {
  const events = req.user.installationId && req.user.installationStatus === 'active'
    ? await listEvents(req.user.installationId) : [];
  res.set('Cache-Control', 'no-store');
  return sendSuccess(res, 200, 'Activity retrieved', { events });
}
