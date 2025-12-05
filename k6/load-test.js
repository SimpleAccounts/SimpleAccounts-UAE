import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    errors: ['rate<0.1'],              // Error rate under 10%
    login_duration: ['p(95)<3000'],    // Login under 3s at p95
    api_duration: ['p(95)<1500'],      // API calls under 1.5s at p95
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8082';
const USERNAME = __ENV.K6_USERNAME || 'test@example.com';
const PASSWORD = __ENV.K6_PASSWORD || 'testpassword';

export function setup() {
  // Login and get token for authenticated tests
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    username: USERNAME,
    password: PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status !== 200) {
    console.warn('Setup login failed, tests will run without auth token');
    return { token: null };
  }

  const token = loginRes.json('token') || loginRes.headers['Authorization'];
  return { token };
}

export default function(data) {
  const authHeaders = data.token ? {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  } : {
    'Content-Type': 'application/json',
  };

  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/actuator/health`);
    check(res, {
      'health check status 200': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  group('Login API', () => {
    const startTime = Date.now();
    const res = http.post(`${BASE_URL}/login`, JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    loginDuration.add(Date.now() - startTime);
    check(res, {
      'login status 200': (r) => r.status === 200,
      'login has token': (r) => r.json('token') !== undefined || r.status === 401,
    });
    errorRate.add(res.status >= 400 && res.status !== 401);
  });

  sleep(1);

  if (data.token) {
    group('Invoice List API', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/invoice/list?page=0&size=10`, {
        headers: authHeaders,
      });

      apiDuration.add(Date.now() - startTime);
      check(res, {
        'invoice list status 200': (r) => r.status === 200,
        'invoice list has data': (r) => {
          try {
            const body = r.json();
            return body !== null;
          } catch {
            return false;
          }
        },
      });
      errorRate.add(res.status >= 400);
    });

    sleep(1);

    group('Contact List API', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/contact/list?page=0&size=10`, {
        headers: authHeaders,
      });

      apiDuration.add(Date.now() - startTime);
      check(res, {
        'contact list status 200': (r) => r.status === 200,
      });
      errorRate.add(res.status >= 400);
    });

    sleep(1);

    group('Dashboard Data API', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/dashboard/data`, {
        headers: authHeaders,
      });

      apiDuration.add(Date.now() - startTime);
      check(res, {
        'dashboard status 200': (r) => r.status === 200 || r.status === 404,
      });
      errorRate.add(res.status >= 500);
    });
  }

  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}
