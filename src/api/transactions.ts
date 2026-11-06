import { apiRequest } from './client';
import type { CheckoutStatus } from '../types/transaction';

/**
 * Poll a checkout session's status. Public, token-authenticated route: the
 * session token is the credential, so no secret key is needed in the app.
 */
export function getCheckoutStatus(
  sessionToken: string,
  publishableKey: string,
  baseUrl: string,
): Promise<CheckoutStatus> {
  return apiRequest<CheckoutStatus>({
    method: 'GET',
    path: `/checkout/sessions/${encodeURIComponent(sessionToken)}/status`,
    publishableKey,
    baseUrl,
  });
}
