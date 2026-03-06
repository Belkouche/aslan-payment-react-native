import { AslanError } from '../types/errors';

/**
 * Validate and normalize a payment link URL.
 * Accepted formats:
 *   - https://pay.aslanpay.ma/pl/ABC123
 *   - https://pay.aslanpay.ma/l/ABC123
 */
export function resolvePaymentLinkUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.match(/^\/(pl|l)\/[A-Za-z0-9_-]+$/)) {
      throw new Error('Invalid path');
    }
    return url;
  } catch {
    throw new AslanError('VALIDATION_ERROR', 'Invalid payment link URL');
  }
}
