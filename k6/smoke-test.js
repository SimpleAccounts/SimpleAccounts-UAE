import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke test - minimal load to verify system works
export const options = {
  vus: 1,           // 1 virtual user
  duration: '30s',  // Run for 30 seconds
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% of requests under 3s
    http_req_failed: ['rate<0.01'],    // Less than 1% failure
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8082';

export default function() {
  // Health check endpoint
  const healthRes = http.get(`${BASE_URL}/actuator/health`);
  check(healthRes, {
    'health check is status 200': (r) => r.status === 200,
    'health check response time OK': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Login endpoint (should return 401 without valid credentials, but endpoint should respond)
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    username: 'smoketest@test.com',
    password: 'invalid',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login endpoint responds': (r) => r.status === 200 || r.status === 401 || r.status === 400,
    'login response time OK': (r) => r.timings.duration < 3000,
  });

  sleep(2);
}
