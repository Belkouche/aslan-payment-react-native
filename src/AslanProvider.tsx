import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import type { AslanConfig, AslanProviderProps } from './types/config';
import type { CheckoutResult } from './types/checkout';
import { validatePublishableKey, isTestMode } from './utils/validation';

const DEFAULT_API_BASE_URL = 'https://api.aslanpay.ma/pay';

export interface AslanContextValue {
  config: Required<Pick<AslanConfig, 'publishableKey' | 'apiBaseUrl'>> & Omit<AslanConfig, 'publishableKey' | 'apiBaseUrl'>;
  isTestMode: boolean;
  isReady: boolean;
  /** Shared ref so the deep-link handler can resolve the active checkout promise */
  deepLinkResolverRef: React.MutableRefObject<((result: CheckoutResult) => void) | null>;
}

export const AslanContext = createContext<AslanContextValue | null>(null);

export function AslanProvider({ children, publishableKey, apiBaseUrl, locale, urlScheme }: AslanProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const deepLinkResolverRef = useRef<((result: CheckoutResult) => void) | null>(null);

  // Validate key on mount
  useEffect(() => {
    validatePublishableKey(publishableKey);
    setIsReady(true);
  }, [publishableKey]);

  // Listen for deep link returns (Level 2: app returns from external browser after 3DS)
  useEffect(() => {
    if (!urlScheme) return;

    const handleDeepLink = (event: { url: string }) => {
      try {
        const parsed = new URL(event.url);
        const status = parsed.searchParams.get('status') as CheckoutResult['status'] | null;
        const transactionId = parsed.searchParams.get('transaction_id') ?? undefined;
        if (status && deepLinkResolverRef.current) {
          deepLinkResolverRef.current({ status, transactionId });
          deepLinkResolverRef.current = null;
        }
      } catch {
        // Malformed deep link — ignore
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [urlScheme]);

  const contextValue = useMemo<AslanContextValue>(
    () => ({
      config: {
        publishableKey,
        apiBaseUrl: apiBaseUrl ?? DEFAULT_API_BASE_URL,
        locale,
        urlScheme,
      },
      isTestMode: isTestMode(publishableKey),
      isReady,
      deepLinkResolverRef,
    }),
    // deepLinkResolverRef is stable (useRef), safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publishableKey, apiBaseUrl, locale, urlScheme, isReady],
  );

  return <AslanContext.Provider value={contextValue}>{children}</AslanContext.Provider>;
}
