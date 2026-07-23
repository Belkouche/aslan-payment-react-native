import { AslanError } from '../types/errors';

const PK_LIVE_PREFIX = 'pk_live_';
const PK_TEST_PREFIX = 'pk_test_';

export function validatePublishableKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new AslanError('INVALID_KEY', 'Publishable key is required');
  }
  if (!key.startsWith(PK_LIVE_PREFIX) && !key.startsWith(PK_TEST_PREFIX)) {
    throw new AslanError(
      'INVALID_KEY',
      `Invalid publishable key format. Key must start with "${PK_LIVE_PREFIX}" or "${PK_TEST_PREFIX}"`,
    );
  }
}

export function isTestMode(key: string): boolean {
  return key.startsWith(PK_TEST_PREFIX);
}

export function validateAmount(amount: number | undefined): void {
  if (amount === undefined || amount === null) return; // open-amount session
  if (!Number.isInteger(amount)) {
    throw new AslanError('VALIDATION_ERROR', 'Amount must be an integer (centimes)');
  }
  if (amount < 100) {
    throw new AslanError('VALIDATION_ERROR', 'Amount must be at least 100 centimes (1.00 MAD)');
  }
  if (amount > 100_000_000) {
    throw new AslanError('VALIDATION_ERROR', 'Amount must be at most 100,000,000 centimes (1,000,000.00 MAD)');
  }
}
