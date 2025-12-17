import { configureStore as rtkConfigureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'

export default function configureStore(initialState = {}) {
  return rtkConfigureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types and paths in state
          ignoredActions: [
            'common/setTostifyAlertFunc',
            'common/tostifyAlert',
            'common/TOSTIFY_ALERT_FUNC',
            'common/TOSTIFY_ALERT',
            'common/getCurrencyConversionList/fulfilled',
          ],
          ignoredActionPaths: [
            'payload.headers',
            'payload.config',
            'payload.config.transformRequest',
            'payload.request',
          ],
          ignoredPaths: ['common.tostifyAlertFunc'],
        },
      }),
  })
}