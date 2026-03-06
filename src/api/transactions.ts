import { apiRequest } from './client';
import type { Transaction } from '../types/transaction';

export function getTransaction(
  transactionId: string,
  publishableKey: string,
  baseUrl: string,
): Promise<Transaction> {
  return apiRequest<Transaction>({
    method: 'GET',
    path: `/api/v1/transactions/${encodeURIComponent(transactionId)}`,
    publishableKey,
    baseUrl,
  });
}
