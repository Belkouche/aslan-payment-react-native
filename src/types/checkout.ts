export interface LineItem {
  name: string;
  quantity: number;
  /** Price per unit in centimes */
  unitPrice: number;
  description?: string;
  sku?: string;
  imageUrl?: string;
  category?: string;
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
  /** Commission rate in basis points (0-10000) */
  commissionRate?: number;
  fixedFee?: number;
  metadata?: Record<string, string>;
}

export interface CheckoutParams {
  /** Amount in centimes (100 = 1.00 MAD). Optional for open-amount sessions. */
  amount?: number;
  /** Only MAD supported */
  currency?: 'MAD';
  /** Override the auto-generated success URL */
  successUrl?: string;
  /** Override the auto-generated cancel URL */
  cancelUrl?: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  metadata?: Record<string, string>;
  lineItems?: LineItem[];
  sellers?: Seller[];
  vendorId?: string;
  /** Alias of an additional PSP account (`^[a-z0-9][a-z0-9-]{0,31}$`). Omit or `"default"` for the default account. */
  providerAccount?: string;
}

export interface CheckoutResult {
  status: 'succeeded' | 'failed' | 'cancelled';
  transactionId?: string;
}
