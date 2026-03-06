import { useCallback, useContext, useRef, useState } from 'react';
import { AslanContext, type AslanContextValue } from './AslanProvider';
import { createCheckoutSession } from './api/checkout';
import { getTransaction as fetchTransaction } from './api/transactions';
import { resolvePaymentLinkUrl } from './api/payment-links';
import type { CheckoutParams, CheckoutResult } from './types/checkout';
import type { Transaction } from './types/transaction';
import { AslanError } from './types/errors';
import { validateAmount } from './utils/validation';

const SDK_CALLBACK_BASE = 'https://api.aslanpay.ma/pay/sdk/callback';

export interface UseAslanReturn {
  checkout: (params: CheckoutParams) => Promise<CheckoutResult>;
  openPaymentLink: (url: string) => Promise<CheckoutResult>;
  getTransaction: (id: string) => Promise<Transaction>;
  isTestMode: boolean;
  isReady: boolean;
  /** Internal: current checkout URL for WebView components */
  _checkoutUrl: string | null;
  /** Internal: resolve the current checkout */
  _resolveCheckout: ((result: CheckoutResult) => void) | null;
  /** Internal: dismiss the checkout modal */
  _dismissCheckout: () => void;
}

export function useAslan(): UseAslanReturn {
  const context = useContext(AslanContext);
  if (!context) {
    throw new AslanError('INVALID_KEY', 'useAslan must be used within an <AslanProvider>');
  }

  const { config, isTestMode, isReady } = context;
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const resolveRef = useRef<((result: CheckoutResult) => void) | null>(null);

  const dismissCheckout = useCallback(() => {
    setCheckoutUrl(null);
    if (resolveRef.current) {
      resolveRef.current({ status: 'cancelled' });
      resolveRef.current = null;
    }
  }, []);

  const checkout = useCallback(
    async (params: CheckoutParams): Promise<CheckoutResult> => {
      validateAmount(params.amount);

      // Generate SDK callback URLs (Level 1: WebView interception)
      const sessionToken = Math.random().toString(36).slice(2);
      const successUrl =
        params.successUrl ?? `${SDK_CALLBACK_BASE}?status=succeeded&session=${sessionToken}`;
      const cancelUrl =
        params.cancelUrl ?? `${SDK_CALLBACK_BASE}?status=cancelled&session=${sessionToken}`;

      const session = await createCheckoutSession(
        {
          amount: params.amount,
          currency: params.currency,
          successUrl,
          cancelUrl,
          customer: params.customer,
          metadata: params.metadata,
          lineItems: params.lineItems,
        },
        config.publishableKey,
        config.apiBaseUrl,
      );

      // Open WebView with checkout URL
      return new Promise<CheckoutResult>((resolve) => {
        resolveRef.current = resolve;
        setCheckoutUrl(session.url);
      });
    },
    [config],
  );

  const openPaymentLink = useCallback(
    async (url: string): Promise<CheckoutResult> => {
      const validatedUrl = resolvePaymentLinkUrl(url);
      return new Promise<CheckoutResult>((resolve) => {
        resolveRef.current = resolve;
        setCheckoutUrl(validatedUrl);
      });
    },
    [],
  );

  const getTransactionFn = useCallback(
    (id: string): Promise<Transaction> => {
      return fetchTransaction(id, config.publishableKey, config.apiBaseUrl);
    },
    [config],
  );

  return {
    checkout,
    openPaymentLink,
    getTransaction: getTransactionFn,
    isTestMode,
    isReady,
    _checkoutUrl: checkoutUrl,
    _resolveCheckout: resolveRef.current,
    _dismissCheckout: dismissCheckout,
  };
}
