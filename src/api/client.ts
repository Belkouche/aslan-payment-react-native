import { AslanError } from '../types/errors';

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  publishableKey: string;
  baseUrl: string;
}

interface ApiResponse<T> {
  data?: T;
}

const KNOWN_CODES = [
  'INVALID_KEY',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'SERVER_ERROR',
  'PROVIDER_ACCOUNT_NOT_FOUND',
  'PROVIDER_ACCOUNT_INACTIVE',
  'PROVIDER_ACCOUNT_UNSUPPORTED',
  'PROVIDER_ACCOUNT_RECURRING_DISABLED',
] as const;

/**
 * The API returns flat errors `{ statusCode, code, error, message, details? }`
 * (where `error` is the HTTP reason phrase string); some routes return the
 * nested form `{ error: { code, message, details? } }`. Accept both.
 */
export function parseErrorBody(json: unknown, status: number): AslanError {
  const body = (json ?? {}) as Record<string, any>;
  const nested = body.error && typeof body.error === 'object' ? body.error : undefined;
  const code = nested?.code ?? body.code;
  const message = nested?.message ?? body.message;
  const errorCode = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'SERVER_ERROR';
  return new AslanError(
    errorCode,
    typeof message === 'string' ? message : `Request failed with status ${status}`,
    status,
  );
}

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const { method, path, body, publishableKey, baseUrl } = options;
  const url = `${baseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publishableKey}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new AslanError('NETWORK_ERROR', 'Network request failed. Check your internet connection.');
  }

  if (response.status === 429) {
    throw new AslanError('RATE_LIMITED', 'Too many requests. Please try again later.', 429);
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new AslanError('SERVER_ERROR', `Unexpected response from server (${response.status})`, response.status);
  }

  if (!response.ok) {
    throw parseErrorBody(json, response.status);
  }

  return json.data ?? (json as unknown as T);
}
