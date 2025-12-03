jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));
import { toast } from 'react-toastify';

const originalLocation = window.location;
let locationHref = '/';

beforeAll(() => {
  if (originalLocation && originalLocation.href) {
    locationHref = originalLocation.href;
  }

  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    get() {
      return locationHref;
    },
    set(value) {
      locationHref = value;
    },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: originalLocation,
  });
});

describe('auth_api interceptors', () => {
  const loadModule = () => {
    let authApi;
    jest.isolateModules(() => {
      authApi = require('./auth_api').default;
    });
    return authApi;
  };

  const getRequestHandler = (client) =>
    client.interceptors.request.handlers.find((handler) => handler)?.fulfilled;

  const getResponseErrorHandler = (client) =>
    client.interceptors.response.handlers.find((handler) => handler)?.rejected;

  beforeEach(() => {
    localStorage.clear();
    toast.error.mockClear();
    locationHref = '/';
  });

  it('configures axios with the API base URL and JSON headers', () => {
    const authApi = loadModule();
    expect(authApi.defaults.baseURL).toBe(window._env_.SIMPLEACCOUNTS_HOST);
    expect(authApi.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('injects Authorization header from localStorage', () => {
    localStorage.setItem('accessToken', 'jwt-token');
    const authApi = loadModule();

    const requestHandler = getRequestHandler(authApi);
    const config = { headers: {} };
    requestHandler(config);

    expect(config.headers.Authorization).toBe('Bearer jwt-token');
  });

  it('clears storage and redirects to login on 401 response', () => {
    localStorage.setItem('accessToken', 'stale-token');
    localStorage.setItem('user', 'cached-user');
    const authApi = loadModule();

    const responseErrorHandler = getResponseErrorHandler(authApi);
    responseErrorHandler({ response: { status: 401 } });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(locationHref).toBe('/login');
    expect(toast.error).toHaveBeenCalledWith('Session Ended. Log in Again !');
  });

  it('propagates non-401 errors to the caller', async () => {
    const authApi = loadModule();
    const responseErrorHandler = getResponseErrorHandler(authApi);

    await expect(
      responseErrorHandler({ response: { status: 500, data: { message: 'Boom' } } }),
    ).rejects.toEqual({ status: 500, data: { message: 'Boom' } });
  });
});
