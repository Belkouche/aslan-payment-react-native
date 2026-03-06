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
}
