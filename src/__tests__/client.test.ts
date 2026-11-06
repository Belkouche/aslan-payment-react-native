import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../api/client';
import { getCheckoutStatus } from '../api/transactions';

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const opts = { method: 'POST' as const, path: '/x', publishableKey: 'pk_test_x', baseUrl: 'https://h' };

afterEach(() => vi.unstubAllGlobals());

describe('apiRequest error parsing', () => {
  it('parses flat errors', async () => {
    mockFetch(422, { statusCode: 422, code: 'PROVIDER_ACCOUNT_NOT_FOUND', error: 'Unprocessable Entity', message: 'no such account' });
    await expect(apiRequest(opts)).rejects.toMatchObject({
      code: 'PROVIDER_ACCOUNT_NOT_FOUND',
      message: 'no such account',
      httpStatus: 422,
    });
  });

  it('parses nested errors', async () => {
    mockFetch(400, { error: { code: 'VALIDATION_ERROR', message: 'bad amount', details: {} } });
    await expect(apiRequest(opts)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', message: 'bad amount', httpStatus: 400 });
  });

  it('falls back to SERVER_ERROR for unknown codes', async () => {
    mockFetch(500, { statusCode: 500, code: 'WEIRD', error: 'Internal Server Error', message: 'boom' });
    await expect(apiRequest(opts)).rejects.toMatchObject({ code: 'SERVER_ERROR', message: 'boom' });
  });

  it('uses a status message when the body has none', async () => {
    mockFetch(502, {});
    await expect(apiRequest(opts)).rejects.toMatchObject({ code: 'SERVER_ERROR', message: 'Request failed with status 502' });
  });
});

describe('getCheckoutStatus', () => {
  it('GETs the public token status route with the publishable key', async () => {
    const fn = mockFetch(200, { status: 'open' });
    await expect(getCheckoutStatus('tok/1', 'pk_test_x', 'https://h')).resolves.toEqual({ status: 'open' });
    expect(fn.mock.calls[0][0]).toBe('https://h/checkout/sessions/tok%2F1/status');
    expect(fn.mock.calls[0][1].method).toBe('GET');
  });
});
