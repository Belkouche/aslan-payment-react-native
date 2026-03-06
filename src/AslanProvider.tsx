import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import type { AslanConfig, AslanProviderProps } from './types/config';
import { validatePublishableKey, isTestMode } from './utils/validation';

const DEFAULT_API_BASE_URL = 'https://api.aslanpay.ma/pay';

export interface AslanContextValue {
  config: Required<Pick<AslanConfig, 'publishableKey' | 'apiBaseUrl'>> & Omit<AslanConfig, 'publishableKey' | 'apiBaseUrl'>;
  isTestMode: boolean;
  isReady: boolean;
}

export const AslanContext = createContext<AslanContextValue | null>(null);

export function AslanProvider({ children, publishableKey, apiBaseUrl, locale, urlScheme }: AslanProviderProps) {
  const [isReady, setIsReady] = useState(false);

  // Validate key on mount
  useEffect(() => {
    validatePublishableKey(publishableKey);
    setIsReady(true);
  }, [publishableKey]);

  // Listen for deep link returns (Level 2 redirect handling)
  useEffect(() => {
    if (!urlScheme) return;

    const handleDeepLink = (event: { url: string }) => {
      // Deep link events are handled by the active checkout promise
      // This listener just ensures the app comes to foreground
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
    }),
    [publishableKey, apiBaseUrl, locale, urlScheme, isReady],
  );

  return <AslanContext.Provider value={contextValue}>{children}</AslanContext.Provider>;
}
