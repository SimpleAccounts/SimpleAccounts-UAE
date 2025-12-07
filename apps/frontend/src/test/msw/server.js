import { setupServer } from 'msw/node';
import { reconcileHandlers } from './handlers/reconcile';

export const server = setupServer(...reconcileHandlers);

export const restOverrides = {
  reset: () => server.resetHandlers(),
};





