import { configureStore as rtkConfigureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer';

export default function configureStore(initialState = {}) {
  // Configure serializable check to ignore FormData in register actions
  return rtkConfigureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types and paths in state
          ignoredActions: [
            'common/setTostifyAlertFunc',
            'common/tostifyAlert',
            'common/TOSTIFY_ALERT_FUNC',
            'common/TOSTIFY_ALERT',
            'common/getCurrencyConversionList/fulfilled',
            'auth/register/pending',
            'auth/register/fulfilled',
            'auth/register/rejected',
          ],
          ignoredActionPaths: [
            'payload.headers',
            'payload.config',
            'payload.config.transformRequest',
            'payload.request',
            'meta.arg', // Ignore FormData in meta.arg for register actions
          ],
          ignoredPaths: ['common.tostifyAlertFunc'],
        },
      }),
  });
}
