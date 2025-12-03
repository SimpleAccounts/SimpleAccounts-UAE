jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

import { toast } from 'react-toastify';

describe('auth_fileupload_api', () => {
  const loadModule = () => {
    let api;
    jest.isolateModules(() => {
      api = require('./auth_fileupload_api').default;
    });
    return api;
  };

  const getRequestHandler = (client) =>
    client.interceptors.request.handlers.find((handler) => handler)?.fulfilled;

  const getResponseErrorHandler = (client) =>
    client.interceptors.response.handlers.find((handler) => handler)?.rejected;

  beforeEach(() => {
    localStorage.clear();
    toast.error.mockClear();
  });

  it('configures axios with API root URL', () => {
    const client = loadModule();
    expect(client.defaults.baseURL).toBe(window._env_.SIMPLEACCOUNTS_HOST);
  });

  it('adds Authorization header for upload requests', () => {
    localStorage.setItem('accessToken', 'upload-token');
    const client = loadModule();

    const requestHandler = getRequestHandler(client);
    const config = { headers: {} };
    requestHandler(config);

    expect(config.headers.Authorization).toBe('Bearer upload-token');
  });

  it('clears auth state and notifies on 401 errors', () => {
    localStorage.setItem('accessToken', 'upload-token');
    const client = loadModule();

    const responseErrorHandler = getResponseErrorHandler(client);
    responseErrorHandler({ response: { status: 401 } });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Session Ended. Log in Again !');
  });

  it('rejects other errors untouched', async () => {
    const client = loadModule();
    const responseErrorHandler = getResponseErrorHandler(client);

    await expect(
      responseErrorHandler({ response: { status: 413, data: { message: 'Too large' } } }),
    ).rejects.toEqual({ status: 413, data: { message: 'Too large' } });
  });
});

