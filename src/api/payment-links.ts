import { AslanError } from '../types/errors';

export interface PaymentLinkParams {
  minAmount?: number;
  maxAmount?: number;
  vendorId?: string;
}

/**
 * Validate and normalize a payment link URL.
 * Accepted formats:
 *   - https://pay.aslanpay.ma/pl/ABC123
 *   - https://pay.aslanpay.ma/l/ABC123
 */
export function resolvePaymentLinkUrl(url: string, params?: PaymentLinkParams): string {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.match(/^\/(pl|l)\/[A-Za-z0-9_-]+$/)) {
      throw new Error('Invalid path');
    }
    if (params) {
      if (params.minAmount !== undefined) {
        parsed.searchParams.set('minAmount', String(params.minAmount));
      }
      if (params.maxAmount !== undefined) {
        parsed.searchParams.set('maxAmount', String(params.maxAmount));
      }
      if (params.vendorId !== undefined) {
        parsed.searchParams.set('vendorId', params.vendorId);
      }
      return parsed.toString();
    }
    return url;
  } catch {
    throw new AslanError('VALIDATION_ERROR', 'Invalid payment link URL');
  }
}
