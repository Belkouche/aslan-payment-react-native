import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { CheckoutResult } from '../types/checkout';

const SDK_CALLBACK_PATH = '/sdk/callback';
const ALLOWED_HOSTS = ['pay.aslanpay.ma', 'api.aslanpay.ma'];

interface AslanWebViewProps {
  url: string;
  onComplete: (result: CheckoutResult) => void;
  onError?: (error: Error) => void;
}

function extractResultFromUrl(url: string): CheckoutResult | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.includes(SDK_CALLBACK_PATH)) {
      // Also check for successUrl/cancelUrl patterns
      const status = parsed.searchParams.get('status');
      const transactionId = parsed.searchParams.get('transaction_id');
      if (status === 'succeeded' || status === 'failed' || status === 'cancelled') {
        return { status, transactionId: transactionId ?? undefined };
      }
      return null;
    }
    const status = parsed.searchParams.get('status') as CheckoutResult['status'] | null;
    const transactionId = parsed.searchParams.get('transaction_id');
    return {
      status: status ?? 'failed',
      transactionId: transactionId ?? undefined,
    };
  } catch {
    return null;
  }
}

export function AslanWebView({ url, onComplete, onError }: AslanWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const completedRef = useRef(false);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (completedRef.current) return;
      const result = extractResultFromUrl(navState.url);
      if (result) {
        completedRef.current = true;
        onComplete(result);
      }
    },
    [onComplete],
  );

  const handleShouldStartLoad = useCallback(
    (event: { url: string }): boolean => {
      try {
        const parsed = new URL(event.url);
        // Allow Aslan domains + PSP redirect domains
        if (ALLOWED_HOSTS.includes(parsed.hostname)) return true;
        // Allow HTTPS external domains (PSP 3DS pages, bank redirects)
        if (parsed.protocol === 'https:') return true;
        // Block non-HTTPS
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const handleError = useCallback(
    (syntheticEvent: { nativeEvent: { description: string } }) => {
      onError?.(new Error(syntheticEvent.nativeEvent.description));
    },
    [onError],
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onError={handleError}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scalesPageToFit={false}
        sharedCookiesEnabled
        // Security: prevent JS injection from SDK
        injectedJavaScript=""
        // Allow 3DS popup windows
        allowsInlineMediaPlayback
        // iOS: allow navigation gestures
        allowsBackForwardNavigationGestures={false}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
