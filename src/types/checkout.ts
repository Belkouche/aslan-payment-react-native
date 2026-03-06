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

export interface CheckoutParams {
  /** Amount in centimes (100 = 1.00 MAD) */
  amount: number;
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
}

export interface CheckoutResult {
  status: 'succeeded' | 'failed' | 'cancelled';
  transactionId?: string;
}
