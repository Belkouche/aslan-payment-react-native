export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'expired'
  | 'refunded';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paidAt?: string;
  createdAt: string;
  /** `"default"`, or the alias of the PSP account that processed this payment. */
  providerAccount?: string;
}

/** Response of `GET /checkout/sessions/:token/status`. */
export interface CheckoutStatus {
  /** Checkout session status, e.g. `open`, `processing`, `complete`, `expired`. */
  status: string;
  transaction?: {
    id: string;
    status: TransactionStatus;
    paidAt: string | null;
  };
}
