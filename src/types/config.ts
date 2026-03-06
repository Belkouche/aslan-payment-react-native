export interface AslanConfig {
  /** Publishable API key (pk_live_* or pk_test_*) */
  publishableKey: string;
  /** API base URL. Defaults to https://api.aslanpay.ma/pay */
  apiBaseUrl?: string;
  /** Locale for the checkout page */
  locale?: 'fr' | 'ar' | 'en';
  /** URL scheme for deep link returns (e.g. "myapp") */
  urlScheme?: string;
}

export interface AslanProviderProps extends AslanConfig {
  children: React.ReactNode;
}
