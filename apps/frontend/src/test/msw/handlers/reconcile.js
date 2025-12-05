const { http, HttpResponse } = require('msw');

const baseUrl =
  (typeof window !== 'undefined' &&
    window._env_ &&
    window._env_.SIMPLEACCOUNTS_HOST) ||
  'http://localhost:8080';

const sampleList = {
  count: 1,
  data: [
    {
      reconcileId: 101,
      reconciledDate: '2024-12-01',
      reconciledDuration: '1 Month',
      closingBalance: 1234.56,
    },
  ],
};

export const reconcileHandlers = [
  http.get('*/rest/reconsile/list', () => {
    return HttpResponse.json(sampleList);
  }),
  http.post('*/rest/reconsile/reconcilenow', async () => {
    return HttpResponse.json({
      status: 1,
      message: 'Reconciled Successfully..',
    });
  }),
  http.delete('*/rest/reconsile/deletes', () => {
    return HttpResponse.json({ status: 'OK' });
  }),
];

