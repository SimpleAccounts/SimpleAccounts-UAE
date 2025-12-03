describe('api client', () => {
  const loadModule = () => {
    let api;
    jest.isolateModules(() => {
      api = require('./api').default;
    });
    return api;
  };

  it('initializes axios with API URL and JSON defaults', () => {
    const api = loadModule();

    expect(api.defaults.baseURL).toBe(window._env_.SIMPLEACCOUNTS_HOST);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('passes successful responses through untouched', () => {
    const api = loadModule();

    const successHandler = api.interceptors.response.handlers.find((handler) => handler)
      ?.fulfilled;
    const response = { status: 200, data: { ok: true } };
    expect(successHandler(response)).toBe(response);
  });

  it('rejects with original error response payload', async () => {
    const api = loadModule();
    const errorHandler = api.interceptors.response.handlers.find((handler) => handler)
      ?.rejected;

    await expect(
      errorHandler({ response: { status: 422, data: { validation: ['Missing'] } } }),
    ).rejects.toEqual({ status: 422, data: { validation: ['Missing'] } });
  });
});

