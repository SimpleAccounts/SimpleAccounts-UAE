/**
 * K6 Performance Test Script for SimpleAccounts-UAE
 *
 * Run with: k6 run --vus 10 --duration 60s load-test.js
 * Or with environment: k6 run -e BASE_URL=http://localhost:8080 load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const invoiceCreatedCounter = new Counter('invoices_created');
const authSuccessRate = new Rate('auth_success_rate');
const invoiceListDuration = new Trend('invoice_list_duration');

// Test configuration
export const options = {
  // Stages for ramp-up testing
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],

  // Thresholds for pass/fail criteria
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s
    http_req_failed: ['rate<0.05'],                   // <5% error rate
    auth_success_rate: ['rate>0.95'],                 // >95% auth success
    invoice_list_duration: ['p(90)<1500'],            // 90% < 1.5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Shared data
let authToken = null;

// Setup function - runs once before tests
export function setup() {
  console.log(`Running performance tests against: ${BASE_URL}`);
  return { baseUrl: BASE_URL };
}

// Authentication helper
function authenticate() {
  const loginPayload = JSON.stringify({
    username: __ENV.TEST_USERNAME || 'admin',
    password: __ENV.TEST_PASSWORD || 'admin123',
  });

  const loginRes = http.post(`${BASE_URL}/api/authenticate`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'authenticate' },
  });

  const success = check(loginRes, {
    'auth status is 200': (r) => r.status === 200,
    'auth response has token': (r) => r.json('token') !== undefined,
  });

  authSuccessRate.add(success);

  if (success) {
    return loginRes.json('token');
  }
  return null;
}

// Main test function
export default function (data) {
  // Authenticate if no token
  if (!authToken) {
    authToken = authenticate();
    if (!authToken) {
      console.error('Authentication failed');
      return;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  // Test groups
  group('Invoice Operations', () => {
    // List invoices
    group('List Invoices', () => {
      const listStart = Date.now();
      const listRes = http.get(`${BASE_URL}/api/invoices?page=0&size=20`, {
        headers,
        tags: { name: 'list_invoices' },
      });

      invoiceListDuration.add(Date.now() - listStart);

      check(listRes, {
        'list status is 200': (r) => r.status === 200,
        'list returns array': (r) => Array.isArray(r.json()),
        'list response time < 2s': (r) => r.timings.duration < 2000,
      });

      sleep(0.5);
    });

    // Create invoice (20% of requests)
    if (Math.random() < 0.2) {
      group('Create Invoice', () => {
        const invoicePayload = JSON.stringify({
          referenceNumber: `INV-K6-${Date.now()}`,
          customerName: `Test Customer ${Math.floor(Math.random() * 1000)}`,
          totalAmount: 100 + Math.floor(Math.random() * 9900),
          invoiceDate: '2024-12-01',
          dueDate: '2024-12-31',
          lineItems: [
            {
              description: 'Test Item',
              quantity: 1,
              unitPrice: 100,
            },
          ],
        });

        const createRes = http.post(`${BASE_URL}/api/invoices`, invoicePayload, {
          headers,
          tags: { name: 'create_invoice' },
        });

        const created = check(createRes, {
          'create status is 200 or 201': (r) => r.status === 200 || r.status === 201,
          'create returns id': (r) => r.json('id') !== undefined,
        });

        if (created) {
          invoiceCreatedCounter.add(1);
        }

        sleep(1);
      });
    }
  });

  group('Dashboard & Reports', () => {
    // Dashboard KPIs
    group('Dashboard KPIs', () => {
      const kpiRes = http.get(`${BASE_URL}/api/dashboard/kpis`, {
        headers,
        tags: { name: 'dashboard_kpis' },
      });

      check(kpiRes, {
        'kpi status is 200': (r) => r.status === 200,
        'kpi response time < 3s': (r) => r.timings.duration < 3000,
      });

      sleep(0.5);
    });

    // Financial report (10% of requests - heavy query)
    if (Math.random() < 0.1) {
      group('Profit & Loss Report', () => {
        const reportRes = http.get(
          `${BASE_URL}/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31`,
          {
            headers,
            tags: { name: 'profit_loss_report' },
          }
        );

        check(reportRes, {
          'report status is 200': (r) => r.status === 200,
          'report response time < 5s': (r) => r.timings.duration < 5000,
        });

        sleep(1);
      });
    }
  });

  // Think time between iterations
  sleep(Math.random() * 2 + 1);
}

// Teardown function - runs once after tests
export function teardown(data) {
  console.log('Performance test completed');
  console.log(`Total invoices created: ${invoiceCreatedCounter.name}`);
}

// Handle test summary
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  // Simple text summary
  const metrics = data.metrics;
  let output = '\n=== Performance Test Summary ===\n\n';

  output += `Total Requests: ${metrics.http_reqs?.count || 0}\n`;
  output += `Failed Requests: ${metrics.http_req_failed?.rate?.toFixed(2) || 0}%\n`;
  output += `Avg Response Time: ${metrics.http_req_duration?.avg?.toFixed(2) || 0}ms\n`;
  output += `95th Percentile: ${metrics.http_req_duration?.['p(95)']?.toFixed(2) || 0}ms\n`;
  output += `99th Percentile: ${metrics.http_req_duration?.['p(99)']?.toFixed(2) || 0}ms\n`;

  output += '\n=== Threshold Results ===\n';
  for (const [name, threshold] of Object.entries(data.thresholds || {})) {
    output += `${name}: ${threshold.ok ? 'PASS' : 'FAIL'}\n`;
  }

  return output;
}
