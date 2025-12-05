import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Stress test - push system to breaking point
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 150 },  // Ramp up to 150 users
    { duration: '5m', target: 150 },  // Stay at 150 users
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% under 5s during stress
    errors: ['rate<0.3'],              // Allow up to 30% errors during stress
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8082';
const USERNAME = __ENV.K6_USERNAME || 'test@example.com';
const PASSWORD = __ENV.K6_PASSWORD || 'testpassword';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    username: USERNAME,
    password: PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

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

  group('Health Check Under Stress', () => {
    const res = http.get(`${BASE_URL}/actuator/health`);
    check(res, {
      'health check survives': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  group('Login Under Stress', () => {
    const res = http.post(`${BASE_URL}/login`, JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'login survives': (r) => r.status === 200 || r.status === 401 || r.status === 429,
    });
    errorRate.add(res.status >= 500);
  });

  sleep(0.5);

  if (data.token) {
    group('API Under Stress', () => {
      const endpoints = [
        '/invoice/list?page=0&size=10',
        '/contact/list?page=0&size=10',
        '/expense/list?page=0&size=10',
      ];

      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = http.get(`${BASE_URL}${endpoint}`, {
        headers: authHeaders,
      });

      check(res, {
        'API survives stress': (r) => r.status < 500,
      });
      errorRate.add(res.status >= 500);
    });
  }

  sleep(1);
}
