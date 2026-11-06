# @aslan/payment-react-native

> Accept payments in your React Native app with a few lines of code. WebView-based hosted checkout -- works with Expo out of the box, zero native setup.

```
Your App  -->  SDK  -->  WebView  -->  Aslan Hosted Checkout  -->  PSP (NAPS / CMI)
              (hook)    (modal)       (secure payment page)       (bank processing)
```

## Features

- **5-minute integration** -- wrap your app, call one hook, done
- **Pure JavaScript** -- no native modules, no `pod install`, no gradle config
- **Expo compatible** -- works with Expo SDK 49+ and bare React Native 0.70+
- **Payment Sheet** -- Stripe-like bottom sheet with swipe-to-dismiss
- **Full-screen Modal** -- `pageSheet` presentation for checkout
- **Payment Links** -- open existing payment links in-app
- **Test mode auto-detection** -- `pk_test_*` keys show a test banner automatically
- **TypeScript-first** -- full type definitions, zero `any`
- **Secure by design** -- publishable keys only, card data never touches your app (SAQ A)

## Installation

```bash
npm install github:Belkouche/aslan-payment-react-native react-native-webview
```

```bash
yarn add github:Belkouche/aslan-payment-react-native react-native-webview
```

For Expo:

```bash
npx expo install react-native-webview
```

### Peer Dependencies

| Package | Why | Required |
|---------|-----|----------|
| `react-native-webview` | Renders the hosted checkout page | Yes |
| `react` | React 18+ | Yes |
| `react-native` | React Native 0.70+ | Yes |

That's it. One peer dependency. No native modules.

## Quick Start

### Step 1: Wrap your app with AslanProvider

```tsx
import { AslanProvider } from '@aslan/payment-react-native';

export default function App() {
  return (
    <AslanProvider publishableKey="pk_live_your_key_here">
      <YourApp />
    </AslanProvider>
  );
}
```

### Step 2: Accept a payment

```tsx
import { useAslan, AslanCheckoutModal } from '@aslan/payment-react-native';

function PayButton() {
  const { checkout, isTestMode, _checkoutUrl, _resolveCheckout, _dismissCheckout } = useAslan();

  const handlePay = async () => {
    const result = await checkout({
      amount: 15000, // 150.00 MAD (centimes)
      customer: {
        email: 'client@example.com',
        name: 'Ahmed Benali',
      },
      metadata: {
        orderId: 'order_abc123',
      },
    });

    if (result.status === 'succeeded') {
      console.log('Payment succeeded:', result.transactionId);
    } else if (result.status === 'cancelled') {
      console.log('User cancelled the payment');
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePay}>
        <Text>Pay 150.00 MAD</Text>
      </TouchableOpacity>

      {_checkoutUrl && (
        <AslanCheckoutModal
          visible={!!_checkoutUrl}
          url={_checkoutUrl}
          onComplete={(result) => {
            _resolveCheckout?.(result);
            _dismissCheckout();
          }}
          onClose={_dismissCheckout}
          testMode={isTestMode}
        />
      )}
    </>
  );
}
```

### Step 3: Or use the Payment Sheet

```tsx
import { useAslan, AslanPaymentSheet } from '@aslan/payment-react-native';

function PayButton() {
  const { checkout, isTestMode, _checkoutUrl, _resolveCheckout, _dismissCheckout } = useAslan();

  return (
    <>
      <TouchableOpacity onPress={() => checkout({ amount: 15000 })}>
        <Text>Pay 150.00 MAD</Text>
      </TouchableOpacity>

      {_checkoutUrl && (
        <AslanPaymentSheet
          visible={!!_checkoutUrl}
          url={_checkoutUrl}
          onComplete={(result) => {
            _resolveCheckout?.(result);
            _dismissCheckout();
          }}
          onClose={_dismissCheckout}
          testMode={isTestMode}
        />
      )}
    </>
  );
}
```

### Step 4: Payment Links

```tsx
const { openPaymentLink } = useAslan();

// Open an existing payment link in-app
await openPaymentLink('https://pay.aslanpay.ma/pl/ABC123');
```

---

## Components

### `<AslanProvider>`

Wraps your app and provides SDK configuration to all child components.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `publishableKey` | `string` | Yes | -- | Your publishable API key (`pk_live_*` or `pk_test_*`) |
| `apiBaseUrl` | `string` | No | `https://api.aslanpay.ma/pay` | API base URL |
| `locale` | `'fr' \| 'ar' \| 'en'` | No | `'fr'` | Checkout page locale |
| `urlScheme` | `string` | No | -- | Deep link URL scheme for external browser returns |

Test mode is auto-detected from the key prefix. `pk_test_*` keys enable test mode.

### `<AslanCheckoutModal>`

Full-screen modal that opens the checkout page in a WebView. Uses `pageSheet` presentation on iOS.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | Yes | Whether the modal is visible |
| `url` | `string` | Yes | Checkout page URL (from `_checkoutUrl`) |
| `onComplete` | `(result: CheckoutResult) => void` | Yes | Called when payment completes or fails |
| `onClose` | `() => void` | Yes | Called when user dismisses the modal |
| `testMode` | `boolean` | No | Show "TEST MODE" banner |

### `<AslanPaymentSheet>`

Stripe-like bottom sheet that slides up from the bottom. Supports swipe-to-dismiss with spring animation. Uses the built-in `Animated` API -- no extra dependencies.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | Yes | Whether the sheet is visible |
| `url` | `string` | Yes | Checkout page URL (from `_checkoutUrl`) |
| `onComplete` | `(result: CheckoutResult) => void` | Yes | Called when payment completes or fails |
| `onClose` | `() => void` | Yes | Called when user dismisses the sheet |
| `testMode` | `boolean` | No | Show "TEST MODE" banner |

The sheet covers 92% of the screen height and dismisses when dragged down past 150px.

### `<AslanWebView>`

Low-level WebView component. Use this if you want full control over the checkout UI.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | Yes | Checkout page URL |
| `onComplete` | `(result: CheckoutResult) => void` | Yes | Called when redirect is intercepted |
| `onError` | `(error: Error) => void` | No | Called on WebView errors |

---

## Hooks

### `useAslan()`

Main hook. Must be called inside an `<AslanProvider>`.

| Return | Type | Description |
|--------|------|-------------|
| `checkout` | `(params: CheckoutParams) => Promise<CheckoutResult>` | Create a checkout session and open the WebView |
| `openPaymentLink` | `(url: string) => Promise<CheckoutResult>` | Open an existing payment link |
| `getTransaction` | `(id: string) => Promise<Transaction>` | Fetch transaction details |
| `isTestMode` | `boolean` | `true` if using a `pk_test_*` key |
| `isReady` | `boolean` | `true` once the SDK is initialized |
| `_checkoutUrl` | `string \| null` | Current checkout URL (pass to Modal/Sheet) |
| `_resolveCheckout` | `((result) => void) \| null` | Resolve the active checkout promise |
| `_dismissCheckout` | `() => void` | Dismiss checkout and resolve as cancelled |

#### `checkout(params: CheckoutParams)`

Creates a checkout session and returns a Promise that resolves when the payment completes, fails, or is cancelled.

```tsx
const result = await checkout({
  amount: 15000,           // Required: 150.00 MAD in centimes
  currency: 'MAD',         // Optional: only MAD supported
  customer: {              // Optional
    email: 'user@example.com',
    name: 'Ahmed Benali',
    phone: '+212600000001',
  },
  metadata: {              // Optional: max 20 keys
    orderId: 'order_123',
    source: 'mobile_app',
  },
  lineItems: [             // Optional: max 50 items
    {
      name: 'Premium Plan',
      quantity: 1,
      unitPrice: 15000,
    },
  ],
  successUrl: 'https://myapp.ma/success',  // Optional: override default
  cancelUrl: 'https://myapp.ma/cancel',    // Optional: override default
});
```

**CheckoutParams**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | `number` | Yes | Amount in centimes. Min: 100 (1.00 MAD). Max: 100,000,000 (1M MAD) |
| `currency` | `'MAD'` | No | Only MAD supported |
| `successUrl` | `string` | No | Custom redirect URL on success. Default: SDK callback URL |
| `cancelUrl` | `string` | No | Custom redirect URL on cancel. Default: SDK callback URL |
| `customer` | `object` | No | `{ email?, name?, phone? }` |
| `metadata` | `Record<string, string>` | No | Custom key-value pairs (max 20 keys, values max 500 chars) |
| `lineItems` | `LineItem[]` | No | Array of line items (max 50) |
| `providerAccount` | `string` | No | Alias of an additional PSP account (`^[a-z0-9][a-z0-9-]{0,31}$`). Omit or `"default"` for the default account |

**CheckoutResult**

| Field | Type | Description |
|-------|------|-------------|
| `status` | `'succeeded' \| 'failed' \| 'cancelled'` | Payment outcome |
| `transactionId` | `string \| undefined` | Transaction ID (present on success/failure) |

#### `getTransaction(id: string)`

Fetch transaction details after a payment.

```tsx
const txn = await getTransaction('txn_abc123');
console.log(txn.status, txn.amount, txn.paidAt);
```

**Transaction**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Transaction ID |
| `amount` | `number` | Amount in centimes |
| `currency` | `string` | Currency code |
| `status` | `TransactionStatus` | `pending`, `processing`, `succeeded`, `failed`, `expired`, `refunded` |
| `paidAt` | `string \| undefined` | ISO 8601 timestamp |
| `createdAt` | `string` | ISO 8601 timestamp |

---

## Payment Flow

### How it works

1. Your app calls `checkout({ amount: 15000 })`
2. SDK validates the amount and creates a checkout session via `POST /api/v1/checkout/sessions/client`
3. API returns a checkout URL and session token
4. SDK opens a WebView modal with the hosted checkout page
5. Customer enters payment details on Aslan's secure page
6. PSP processes the payment (NAPS, CMI, etc.)
7. PSP redirects to Aslan's callback URL
8. SDK intercepts the redirect URL in the WebView, extracts `status` and `transaction_id`
9. SDK closes the WebView and resolves the Promise with `{ status: 'succeeded', transactionId }`

### Redirect Strategies

The SDK supports three levels of redirect handling:

**Level 1: WebView interception (default, zero config)**

The SDK auto-generates callback URLs pointing to `/sdk/callback`. When the WebView navigates to this URL, the SDK intercepts the redirect, extracts the result, and closes the modal. This is the default -- you don't need to configure anything.

**Level 2: Deep links (for external browser flows)**

If a PSP opens an external browser for 3DS verification, the SDK can catch the return via deep links:

```tsx
<AslanProvider publishableKey="pk_live_xxx" urlScheme="myapp">
```

The API callback page will auto-redirect to `myapp://callback?status=succeeded&transaction_id=xxx`.

**Level 3: Custom merchant URLs**

Pass your own `successUrl` / `cancelUrl` if you want to handle redirects yourself:

```tsx
const result = await checkout({
  amount: 15000,
  successUrl: 'https://myshop.ma/payment/success',
  cancelUrl: 'https://myshop.ma/payment/cancel',
});
```

---

## Error Handling

All SDK errors are instances of `AslanError` with a typed `code` property.

```tsx
import { AslanError } from '@aslan/payment-react-native';

try {
  const result = await checkout({ amount: 15000 });
} catch (error) {
  if (error instanceof AslanError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        // No internet connection
        break;
      case 'RATE_LIMITED':
        // Too many requests (10/min per merchant)
        break;
      case 'VALIDATION_ERROR':
        // Invalid params (amount too low, etc.)
        break;
      case 'INVALID_KEY':
        // Bad publishable key format
        break;
      case 'SERVER_ERROR':
        // Aslan API returned an error
        break;
    }
  }
}
```

### Error Codes

| Code | Description | When |
|------|-------------|------|
| `INVALID_KEY` | Invalid publishable key format | Key doesn't start with `pk_live_` or `pk_test_` |
| `NETWORK_ERROR` | Network request failed | No internet, DNS failure, timeout |
| `CHECKOUT_CANCELLED` | User dismissed the checkout | User closed the modal/sheet |
| `CHECKOUT_FAILED` | Payment failed | PSP rejected the payment |
| `VALIDATION_ERROR` | Invalid parameters | Amount < 100, missing required fields |
| `RATE_LIMITED` | Too many requests | Over 10 checkout sessions/minute |
| `SERVER_ERROR` | Server-side error | Aslan API 5xx or unexpected response |
| `PROVIDER_ACCOUNT_NOT_FOUND` | Unknown `providerAccount` | Alias names no account of your merchant |
| `PROVIDER_ACCOUNT_INACTIVE` | Deactivated `providerAccount` | The account exists but is deactivated |
| `PROVIDER_ACCOUNT_UNSUPPORTED` | Account cannot take the request | The account's provider does not support this checkout |
| `PROVIDER_ACCOUNT_RECURRING_DISABLED` | Recurring disabled | The account does not allow recurring payments |

---

## Utilities

### `formatMAD(centimes: number): string`

Format centimes to a human-readable MAD string using Moroccan locale.

```tsx
import { formatMAD } from '@aslan/payment-react-native';

formatMAD(15000);     // "150,00 MAD"
formatMAD(100);       // "1,00 MAD"
formatMAD(999900);    // "9 999,00 MAD"
formatMAD(50);        // "0,50 MAD"
```

---

## Type Reference

```ts
// Config
interface AslanConfig {
  publishableKey: string;
  apiBaseUrl?: string;
  locale?: 'fr' | 'ar' | 'en';
  urlScheme?: string;
}

// Checkout
interface CheckoutParams {
  amount: number;
  currency?: 'MAD';
  successUrl?: string;
  cancelUrl?: string;
  customer?: { email?: string; name?: string; phone?: string };
  metadata?: Record<string, string>;
  lineItems?: LineItem[];
  providerAccount?: string;
}

interface CheckoutResult {
  status: 'succeeded' | 'failed' | 'cancelled';
  transactionId?: string;
}

interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  sku?: string;
  imageUrl?: string;
  category?: string;
}

// Transaction
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paidAt?: string;
  createdAt: string;
}

type TransactionStatus =
  | 'pending' | 'processing' | 'succeeded'
  | 'failed' | 'expired' | 'refunded';

// Errors
class AslanError extends Error {
  code: AslanErrorCode;
  httpStatus?: number;
}

type AslanErrorCode =
  | 'INVALID_KEY' | 'NETWORK_ERROR' | 'CHECKOUT_CANCELLED'
  | 'CHECKOUT_FAILED' | 'VALIDATION_ERROR' | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'PROVIDER_ACCOUNT_NOT_FOUND' | 'PROVIDER_ACCOUNT_INACTIVE'
  | 'PROVIDER_ACCOUNT_UNSUPPORTED' | 'PROVIDER_ACCOUNT_RECURRING_DISABLED';
```

---

## Testing

### Test mode

Use a `pk_test_*` publishable key to enable test mode. The SDK automatically:

- Detects test keys and sets `isTestMode: true`
- Shows a "TEST MODE" banner in the checkout modal and payment sheet
- Routes payments to the staging environment

### Test credentials

| Item | Value |
|------|-------|
| Test key prefix | `pk_test_*` |
| Staging API | `https://staging-api.aslanpay.ma/pay` |
| Test cards | Use NAPS staging test cards |

---

## Configuration

### Custom API URL

For self-hosted or staging environments:

```tsx
<AslanProvider
  publishableKey="pk_test_xxx"
  apiBaseUrl="https://staging-api.aslanpay.ma/pay"
/>
```

### Deep Link Setup

For handling 3DS bank redirects that open in an external browser:

```tsx
<AslanProvider publishableKey="pk_live_xxx" urlScheme="myapp">
```

Then configure your app's URL scheme in `app.json` (Expo) or `Info.plist` / `AndroidManifest.xml` (bare RN).

---

## Security

- **Publishable keys only** -- secret keys (`sk_*`) must never be embedded in mobile apps. The SDK validates key format on initialization and rejects secret keys.
- **SAQ A compliance** -- card data is entered on Aslan's hosted checkout page, never in your app. Your app never sees card numbers, CVVs, or expiry dates.
- **WebView sandboxed** -- the SDK does not inject JavaScript into the checkout page. No cross-origin data extraction.
- **HTTPS enforced** -- all API calls use HTTPS. Non-HTTPS URLs are blocked in the WebView.
- **No sensitive data stored** -- the SDK stores no payment data, tokens, or credentials on device.

---

## Requirements

| Requirement | Minimum Version |
|-------------|-----------------|
| React Native | 0.70+ |
| React | 18.0+ |
| react-native-webview | 13.0+ |
| Expo SDK | 49+ (if using Expo) |
| iOS | 13.0+ |
| Android | API 21+ (Android 5.0) |

---

## Example App

A complete example app is included in the `example/` directory.

```bash
cd example
npm install
npx expo start
```

The example demonstrates:
- Checkout with configurable amount
- Toggle between Modal and Payment Sheet
- Payment link opening
- Amount formatting with `formatMAD`
- Test mode indicator

---

## Changelog

### 0.1.0

- Initial release
- `AslanProvider` with publishable key auth
- `useAslan()` hook with `checkout()`, `openPaymentLink()`, `getTransaction()`
- `AslanCheckoutModal` -- full-screen modal
- `AslanPaymentSheet` -- bottom sheet with swipe-to-dismiss
- `AslanWebView` -- WebView with redirect interception
- `AslanError` typed error class
- `formatMAD()` currency formatting utility
- TypeScript type definitions
- Example Expo app

## License

MIT -- see [LICENSE](./LICENSE)

---

Built in Morocco by [Aslan](https://aslanpay.ma)
