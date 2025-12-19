import { vi, describe, it, expect } from 'vitest';

describe('api client', () => {
  // Use vi.resetModules() and dynamic import for module isolation in Vitest
  const loadModule = async () => {
    vi.resetModules();
    const module = await import('./api');
    return module.default;
  };

  it('initializes axios with API URL and JSON defaults', async () => {
    const api = await loadModule();

    expect(api.defaults.baseURL).toBe(window._env_.SIMPLEACCOUNTS_HOST);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('passes successful responses through untouched', async () => {
    const api = await loadModule();

    const successHandler = api.interceptors.response.handlers.find(handler => handler)?.fulfilled;
    const response = { status: 200, data: { ok: true } };
    expect(successHandler(response)).toBe(response);
  });

  it('rejects with original error response payload', async () => {
    const api = await loadModule();
    const errorHandler = api.interceptors.response.handlers.find(handler => handler)?.rejected;

    await expect(
      errorHandler({ response: { status: 422, data: { validation: ['Missing'] } } })
    ).rejects.toEqual({ status: 422, data: { validation: ['Missing'] } });
  });
});
