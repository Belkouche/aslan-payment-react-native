export type AslanErrorCode =
  | 'INVALID_KEY'
  | 'NETWORK_ERROR'
  | 'CHECKOUT_CANCELLED'
  | 'CHECKOUT_FAILED'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR';

export class AslanError extends Error {
  readonly code: AslanErrorCode;
  readonly httpStatus?: number;

  constructor(code: AslanErrorCode, message: string, httpStatus?: number) {
    super(message);
    this.name = 'AslanError';
    this.code = code;
    this.httpStatus = httpStatus;
    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, AslanError.prototype);
  }
}
