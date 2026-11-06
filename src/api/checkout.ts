import { apiRequest } from './client';

export interface CreateSessionRequest {
  amount?: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  metadata?: Record<string, string>;
  lineItems?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    description?: string;
    sku?: string;
    imageUrl?: string;
    category?: string;
  }>;
  sellers?: Array<{
    id: string;
    name: string;
    email?: string;
    commissionRate?: number;
    fixedFee?: number;
    metadata?: Record<string, string>;
  }>;
  vendorId?: string;
  providerAccount?: string;
}

export interface CheckoutSessionResponse {
  id: string;
  token: string;
  url: string;
  expiresAt: string;
}

export function createCheckoutSession(
  params: CreateSessionRequest,
  publishableKey: string,
  baseUrl: string,
): Promise<CheckoutSessionResponse> {
  return apiRequest<CheckoutSessionResponse>({
    method: 'POST',
    path: '/api/v1/checkout/sessions/client',
    body: params as unknown as Record<string, unknown>,
    publishableKey,
    baseUrl,
  });
}
