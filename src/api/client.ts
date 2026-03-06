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
  error?: { code: string; message: string };
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
    const code = json.error?.code ?? 'SERVER_ERROR';
    const message = json.error?.message ?? `Request failed with status ${response.status}`;
    const errorCode = (['INVALID_KEY', 'VALIDATION_ERROR', 'RATE_LIMITED', 'SERVER_ERROR'] as const).includes(
      code as any,
    )
      ? (code as any)
      : 'SERVER_ERROR';
    throw new AslanError(errorCode, message, response.status);
  }

  return json.data ?? (json as unknown as T);
}
